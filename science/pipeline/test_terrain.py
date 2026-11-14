"""Offline controls: run with uv run --locked python -m unittest discover -s science/pipeline."""
import unittest

import numpy as np
from rasterio.io import MemoryFile
from rasterio.transform import from_origin

from terrain import (
    BOLIVIA_CRS, CATALOG, CELLS, PIXEL_M, CERRO, METRICS,
    horn_slope, measure, projected_center, rank, read_window,
)


class TerrainControls(unittest.TestCase):
    def test_plane_metrics(self):
        x = np.arange(100) * PIXEL_M
        flat, _ = measure(np.full((100, 100), 100.0))
        self.assertDictEqual(flat, dict.fromkeys(METRICS, 0.0))
        height = 12 + np.broadcast_to(x, (100, 100))
        metrics, info = measure(height)
        self.assertAlmostEqual(metrics["slopeMedianDeg"], 45.0)
        self.assertAlmostEqual(metrics["slopeP90Deg"], 45.0)
        self.assertAlmostEqual(metrics["reliefM"], 0.90 * 99 * PIXEL_M)
        self.assertEqual(info["slopeCells"], 98**2)

    def test_missing_elevation(self):
        height = np.zeros((100, 100))
        height[50, 50] = np.nan
        self.assertEqual(horn_slope(height).size, 98**2 - 9)
        height[:6] = np.nan
        metrics, evidence = measure(height)
        self.assertIsNone(metrics)
        self.assertEqual(evidence["reason"], "coverage_below_95_percent")

    def test_average_and_nodata_at_source_resolution(self):
        cell = 20
        rows, cols = np.indices((200, 200))
        native = (rows * 3 + cols * 7).astype(np.float64)
        native[50, 50] = -99999
        with MemoryFile() as memory:
            with memory.open(driver="GTiff", width=200, height=200, count=1, dtype="float64",
                             crs=BOLIVIA_CRS.to_wkt(), transform=from_origin(400000, 8004000, cell, cell),
                             nodata=-99999) as dst:
                dst.write(native, 1)
            with memory.open() as src:
                result = read_window(src, BOLIVIA_CRS, (402000, 8002000))
        self.assertEqual(result.shape, (CELLS, CELLS))
        self.assertEqual(result[0, 0], 5.0)
        self.assertEqual(result[20, 20], 405.0)
        self.assertTrue(np.isnan(result[25, 25]))
        self.assertEqual(np.isfinite(result).sum(), CELLS**2 - 1)

    def test_catalog_stays_fixed_and_contiguous(self):
        self.assertEqual(len(CATALOG), 25)
        self.assertNotIn(CERRO.id, {x.id for x in CATALOG})
        first = projected_center(CATALOG[0], BOLIVIA_CRS)
        right = projected_center(CATALOG[1], BOLIVIA_CRS)
        down = projected_center(CATALOG[5], BOLIVIA_CRS)
        self.assertEqual((right[0] - first[0], first[1] - down[1]), (4000, 4000))

    def test_ranking_zero_distance_and_tie_order(self):
        def place(id_, relief):
            return {"id": id_, "metrics": dict(zip(METRICS, (3, 24, relief)))}

        ranks, fit = rank([place("b", 30), place("a", 10), place("c", 20)], place("query", 20))
        self.assertEqual(fit["usedMetrics"], ["reliefM"])
        self.assertEqual([row["id"] for row in ranks], ["c", "a", "b"])
        self.assertEqual(ranks[0]["distance"], 0)
        self.assertEqual(ranks[1]["distance"], ranks[2]["distance"])
        self.assertEqual(rank([place("a", 20), place("b", 20)], place("query", 30))[0], [])


if __name__ == "__main__":
    unittest.main()
