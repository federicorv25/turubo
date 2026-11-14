"""Generate reproducible 4 km terrain comparisons from the three pinned DEMs."""
from __future__ import annotations

import argparse
from contextlib import ExitStack
from dataclasses import dataclass
import hashlib
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from pyproj import CRS, Transformer, __proj_version__
import rasterio
from rasterio.enums import Resampling
from rasterio.transform import from_origin
from rasterio.warp import reproject, transform_bounds
from rasterio.windows import Window

HERE = Path(__file__).resolve().parent
SOURCES = json.loads((HERE / "sources.json").read_text(encoding="utf-8"))
WINDOW_M, PIXEL_M = 4000, 40
CELLS = WINDOW_M // PIXEL_M
MIN_COVERAGE = 0.95
METRICS = ("slopeMedianDeg", "slopeP90Deg", "reliefM")
MAP_LIMIT_M = 100
NODATA_RGB = (83, 65, 116)
BOLIVIA_CRS = CRS.from_epsg(32720)


@dataclass(frozen=True)
class Spec:
    id: str
    name: str
    body: str
    role: str
    coordinates: str
    center: tuple[float, float]
    grid_offset: tuple[int, int] = (0, 0)


VALLE = (-60.7680094, -17.8744281)
CERRO = Spec("bo-cerro-turubo", "Cerro Turubó", "earth", "guided", "longitude_east_latitude", (-60.7095623, -17.858344))
NOBILE = Spec("moon-nobile-rim-1", "Nobile Rim 1", "moon", "reference", "product_easting_northing_m", (84000, 110000))
JEZERO = Spec("mars-jezero", "Jezero", "mars", "reference", "longitude_east_latitude", (77.4508, 18.4447))
CATALOG = tuple(
    Spec(
        f"bo-r{row:02d}-c{col:02d}",
        f"Valle de la Luna · R{row:02d} C{col:02d}",
        "earth", "candidate", "longitude_east_latitude", VALLE,
        ((col - 3) * WINDOW_M, (3 - row) * WINDOW_M),
    )
    for row in range(1, 6) for col in range(1, 6)
)


def sha256(path: Path) -> str:
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def write_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2, allow_nan=False) + "\n", encoding="utf-8")


def projected_center(spec: Spec, target: CRS) -> tuple[float, float]:
    if spec.coordinates == "product_easting_northing_m":
        x, y = spec.center
    else:
        # Use the destination body's own geodetic CRS, including for Mars.
        x, y = Transformer.from_crs(target.geodetic_crs, target, always_xy=True).transform(
            *spec.center, errcheck=True
        )
    return x + spec.grid_offset[0], y + spec.grid_offset[1]


def read_window(src, target: CRS, center: tuple[float, float]) -> np.ndarray:
    x, y = center
    half = WINDOW_M / 2
    bounds = x - half, y - half, x + half, y + half
    source_crs = CRS.from_wkt(src.crs.to_wkt())
    source_bounds = transform_bounds(target, source_crs, *bounds, densify_pts=21)
    window = rasterio.windows.from_bounds(*source_bounds, transform=src.transform)
    # Include an invalid margin for overlap/resampling, even at source edges.
    left, top = math.floor(window.col_off) - 2, math.floor(window.row_off) - 2
    right = math.ceil(window.col_off + window.width) + 2
    bottom = math.ceil(window.row_off + window.height) + 2
    window = Window(left, top, right - left, bottom - top)
    raw = src.read(1, window=window, boundless=True, masked=True).astype(np.float64)
    numeric = raw.filled(np.nan) * src.scales[0] + src.offsets[0]
    source_valid = np.isfinite(numeric)
    numeric[~source_valid] = np.nan
    reprojection = {
        "src_transform": src.window_transform(window), "src_crs": src.crs,
        "dst_transform": from_origin(bounds[0], bounds[3], PIXEL_M, PIXEL_M),
        "dst_crs": target.to_wkt(), "resampling": Resampling.average,
    }
    height = np.full((CELLS, CELLS), np.nan, dtype=np.float64)
    valid_fraction = np.zeros((CELLS, CELLS), dtype=np.float64)
    reproject(numeric, height, src_nodata=np.nan, dst_nodata=np.nan, **reprojection)
    reproject(source_valid.astype(np.float64), valid_fraction, dst_nodata=0.0, **reprojection)
    # GDAL's mean excludes invalid contributors. Reject mixed cells so that
    # a cell computed from a fraction of the source footprint is not counted.
    height[valid_fraction < 1.0 - 1e-9] = np.nan
    return height


def horn_slope(height: np.ndarray, cell_m: float = PIXEL_M) -> np.ndarray:
    """Slope in degrees. Exclude borders and any incomplete 3×3 stencil."""
    block = np.lib.stride_tricks.sliding_window_view(height, (3, 3))
    z = block[np.isfinite(block).all(axis=(-2, -1))]
    dx = (z[:, 0, 2] + 2 * z[:, 1, 2] + z[:, 2, 2]
          - z[:, 0, 0] - 2 * z[:, 1, 0] - z[:, 2, 0]) / (8 * cell_m)
    dy = (z[:, 2, 0] + 2 * z[:, 2, 1] + z[:, 2, 2]
          - z[:, 0, 0] - 2 * z[:, 0, 1] - z[:, 0, 2]) / (8 * cell_m)
    return np.degrees(np.arctan(np.hypot(dx, dy)))


def measure(height: np.ndarray) -> tuple[dict | None, dict]:
    values = height[np.isfinite(height)]
    info = {"validCells": int(values.size), "coverage": float(values.size / height.size)}
    if info["coverage"] < MIN_COVERAGE:
        return None, {**info, "reason": "coverage_below_95_percent"}
    slopes = horn_slope(height)
    if not slopes.size:
        return None, {**info, "reason": "no_complete_slope_neighborhood"}
    p5, p95 = np.percentile(values, (5, 95))
    baseline = float(np.median(values))
    metrics = (np.median(slopes), np.percentile(slopes, 90), p95 - p5)
    return dict(zip(METRICS, map(float, metrics))), {
        **info, "slopeCells": int(slopes.size), "elevationMedianM": baseline,
        "saturatedFraction": float(np.mean(np.abs(values - baseline) > MAP_LIMIT_M)),
    }


def north_vector(target: CRS, x: float, y: float) -> tuple[float, float]:
    geodetic = target.geodetic_crs
    lon, lat = Transformer.from_crs(target, geodetic, always_xy=True).transform(x, y, errcheck=True)
    north_x, north_y = Transformer.from_crs(geodetic, target, always_xy=True).transform(
        lon, min(lat + 0.01, 89.999999), errcheck=True
    )
    length = math.hypot(north_x - x, north_y - y)
    return (north_x - x) / length, (y - north_y) / length


def draw_map(path: Path, height: np.ndarray, median: float, north: tuple[float, float]) -> None:
    valid = np.isfinite(height)
    relative = np.where(valid, height - median, 0.0)
    grayscale = np.rint((np.clip(relative, -MAP_LIMIT_M, MAP_LIMIT_M) + MAP_LIMIT_M) * 255 / (2 * MAP_LIMIT_M))
    colors = np.repeat(grayscale.astype(np.uint8)[..., None], 3, axis=2)
    colors[~valid] = NODATA_RGB
    map_image = Image.fromarray(colors).resize((300, 300), Image.Resampling.NEAREST)
    canvas = Image.new("RGB", (320, 384), "#121b2b")
    canvas.paste(map_image, (10, 10))
    draw = ImageDraw.Draw(canvas)
    small = ImageFont.load_default(size=11)
    ink = "#f1f4fa"
    draw.rectangle((9, 9, 310, 310), outline="#70829a")
    draw.line((12, 327, 87, 327), fill=ink, width=2)
    for x in (12, 87):
        draw.line((x, 324, x, 330), fill=ink, width=2)
    draw.text((96, 327), "1 km", fill=ink, font=small, anchor="lm")
    draw.text((170, 327), "4 x 4 km", fill=ink, font=small, anchor="mm")
    dx, dy = north
    x0, y0 = 274, 329
    tip = x0 + 11 * dx, y0 + 11 * dy
    draw.line((x0 - 6 * dx, y0 - 6 * dy, *tip), fill=ink, width=2)
    draw.polygon((tip, (tip[0] - 5 * dx + 3 * dy, tip[1] - 5 * dy - 3 * dx),
                       (tip[0] - 5 * dx - 3 * dy, tip[1] - 5 * dy + 3 * dx)), fill=ink)
    draw.text((302, 327), "N", fill=ink, font=small, anchor="mm")
    for index in range(200):
        gray = round(index * 255 / 199)
        draw.line((12 + index, 349, 12 + index, 358), fill=(gray, gray, gray))
    for x, label, anchor in [(12, "-100 m", "lm"), (112, "0", "mm"), (211, "+100 m", "rm")]:
        draw.text((x, 371), label, fill=ink, font=small, anchor=anchor)
    draw.rectangle((245, 349, 259, 358), fill=NODATA_RGB, outline="#b6a5d8")
    draw.text((267, 354), "NoData", fill=ink, font=small, anchor="lm")
    canvas.save(path, optimize=True)


def rank(candidates: list[dict], reference: dict) -> tuple[list[dict], dict]:
    if not candidates:
        return [], {}
    values = np.array([[item["metrics"][key] for key in METRICS] for item in candidates])
    query = np.array([reference["metrics"][key] for key in METRICS])
    mean = values.mean(axis=0)
    std = values.std(axis=0)
    use = np.ptp(values, axis=0) > 0  # stable even when a constant mean has round-off
    params = {
        "usedMetrics": [key for key, used in zip(METRICS, use) if used],
        "earthMean": dict(zip(METRICS, map(float, mean))),
        "earthPopulationStd": dict(zip(METRICS, map(float, np.where(use, std, 0)))),
        "validCandidates": len(values),
    }
    if not use.any():
        return [], params
    # Subtracting the two z-scores cancels the common terrestrial mean.
    distances = np.linalg.norm((values[:, use] - query[use]) / std[use], axis=1)
    ordered = sorted(zip(distances, (candidate["id"] for candidate in candidates)))
    return [{"id": id_, "distance": float(distance)} for distance, id_ in ordered], params


def run(inputs: Path, output: Path, preflight: bool) -> None:
    output.mkdir(parents=True, exist_ok=True)
    specs = (CATALOG[12], NOBILE, JEZERO) if preflight else (*CATALOG, CERRO, NOBILE, JEZERO)
    if not preflight:
        (output / "maps").mkdir(exist_ok=True)
    terrains, windows, products = {}, {}, {}
    with ExitStack() as stack:
        datasets = {}
        for body, source in SOURCES.items():
            file = inputs / source["file"]
            if not file.is_file():
                products[body] = {**source, "status": "missing_input"}
                continue
            digest = sha256(file)
            if digest != source["sha256"]:
                raise ValueError(f"SHA-256 mismatch for {file.name}: {digest}")
            src = stack.enter_context(rasterio.open(file))
            if src.count != 1 or not src.crs:
                raise ValueError(f"{file.name} must be a referenced single-band DEM")
            if src.units[0] not in (None, "m", "meter", "metre") or source["elevationUnit"] != "m":
                raise ValueError(f"Unexpected elevation unit for {file.name}: {src.units[0]}")
            native = CRS.from_wkt(src.crs.to_wkt())
            target = BOLIVIA_CRS if body == "earth" else native
            if not target.is_projected or any(axis.unit_conversion_factor != 1.0 for axis in target.axis_info):
                raise ValueError(f"Expected a projected metric CRS for {file.name}")
            products[body] = {
                **source, "status": "opened", "bytes": file.stat().st_size,
                "sourceCRS": src.crs.to_wkt(), "targetCRS": target.to_wkt(),
                "sourceSizePx": [src.width, src.height], "sourceBounds": list(src.bounds),
                "sourcePixelSize": list(src.res), "sourcePixelUnit": native.axis_info[0].unit_name,
                "sourceNoData": "NaN" if src.nodata is not None and math.isnan(src.nodata) else src.nodata,
                "bandUnitTag": src.units[0], "bandScale": src.scales[0], "bandOffset": src.offsets[0],
            }
            datasets[body] = (src, target)
        for spec in specs:
            info = {
                "name": spec.name, "body": spec.body, "role": spec.role,
                "inputCoordinates": {"kind": spec.coordinates, "values": list(spec.center)},
                "gridOffsetM": list(spec.grid_offset),
            }
            if spec.body not in datasets:
                windows[spec.id] = {**info, "reason": "missing_input"}
                continue
            src, target = datasets[spec.body]
            x, y = projected_center(spec, target)
            half = WINDOW_M / 2
            info.update(centerM=[x, y], boundsM=[x - half, y - half, x + half, y + half])
            height = read_window(src, target, (x, y))
            metrics, measurements = measure(height)
            info.update(measurements)
            windows[spec.id] = info
            if metrics is None:
                continue
            info["metrics"] = metrics
            if not preflight:
                image = f"maps/{spec.id}.png"
                draw_map(output / image, height, info["elevationMedianM"], north_vector(target, x, y))
                info["map"] = image
                info["mapSha256"] = sha256(output / image)
                terrains[spec.id] = {
                    "id": spec.id, "name": spec.name, "body": spec.body,
                    "source": SOURCES[spec.body]["productUrl"], "image": image,
                    "resolutionM": PIXEL_M, "coverage": info["coverage"], "metrics": metrics,
                }
    audit = {
        "version": 1, "stage": "preflight" if preflight else "measured_pending_team_review",
        "software": {"rasterio": rasterio.__version__, "gdal": rasterio.__gdal_version__,
                     "proj": __proj_version__, "numpy": np.__version__},
        "method": {
            "windowM": WINDOW_M, "gridPx": [CELLS, CELLS], "resolutionM": PIXEL_M,
            "coverageMinimum": MIN_COVERAGE,
            "resampling": "GDAL average; mask cells where any part of the sampled footprint is invalid",
            "slope": "Horn 3x3, degrees, exclude edges and incomplete stencils",
            "relief": "P95 minus P5 elevation, meters; linear quantiles",
            "map": "Grid +Y up; N arrow gives geodetic north at the center. Common gray scale around window median; purple = NoData.",
            "colorRangeRelativeM": [-MAP_LIMIT_M, MAP_LIMIT_M],
            "ranking": "Euclidean distance using population standard deviations of valid Earth candidates only; omit constant metrics; tie by ID.",
            "limitations": "Relative topography at a common grid size. No absolute elevation, geology, climate, resources or landing safety comparison.",
        },
        "products": products, "windows": windows,
    }
    if preflight:
        write_json(output / "preflight.json", audit)
        return

    candidates = [terrains[spec.id] for spec in CATALOG if spec.id in terrains]
    comparisons, ranking = {}, {}
    for destination, spec in (("moon", NOBILE), ("mars", JEZERO)):
        reference = terrains.get(spec.id)
        places, parameters = rank(candidates, reference) if reference else ([], {})
        ranking[destination] = {**parameters, "referenceId": spec.id, "allDistances": places}
        if places:
            comparisons[destination] = {"status": "reviewed", "referenceId": spec.id, "ranked": places[:3]}
            if CERRO.id in terrains:
                comparisons[destination]["guidedId"] = CERRO.id
        else:
            reason = "reference_unavailable" if reference is None else "no_discriminating_catalog_metrics"
            comparisons[destination] = {"status": "not_assessed", "ranked": []}
            ranking[destination]["reason"] = reason
    audit["ranking"] = ranking
    write_json(output / "manifest.json", audit)
    # "reviewed" activates the finished UI for local verification. The real
    # data are not designated for publication until the destination reviews.
    write_json(output / "analysis.preview.json", {
        "version": 1, "simulated": False, "reviewStage": "technical_preview_pending_team_review",
        "terrains": list(terrains.values()), "comparisons": comparisons,
    })


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--inputs", type=Path, default=HERE.parent / "cache" / "inputs")
    parser.add_argument("--output", type=Path, default=HERE.parent / "cache" / "results")
    parser.add_argument("--preflight", action="store_true", help="Only measure the center Earth, Moon and Mars windows")
    opts = parser.parse_args()
    run(opts.inputs, opts.output, opts.preflight)
