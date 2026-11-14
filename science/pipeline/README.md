# Comparaciones de terreno · #12

Este módulo transforma los tres DEM originales en ventanas comparables para TURUBO Atlas. La carpeta [preview/](preview/) contiene **datos calculados y verificables, pendientes de revisión del equipo para publicar**. En la web estable, la carga de resultados es trabajo de [#9](https://github.com/federicorv25/turubo-atlas/issues/9).

| Cuerpo | Producto | Ventana |
|---|---|---|
| Tierra | [NASADEM HGT v001](https://doi.org/10.5067/MEASURES/NASADEM/NASADEM_HGT.001), tesela s18w061 de [OpenTopography](https://portal.opentopography.org/datasetMetadata?otCollectionID=OT.032021.4326.2) | 25 recortes fijos de 4 × 4 km alrededor del Valle de la Luna de San José de Chiquitos y el Cerro Turubó como caso guiado aparte, en UTM 20S. |
| Luna | [NASA LRO/LOLA Site06](https://pgda.gsfc.nasa.gov/products/78), LDEM 5 m/píxel | Nobile Rim 1, centro 84 000 E / 110 000 N en la proyección polar lunar del producto. |
| Marte | [USGS/NASA CTX Jezero DEM](https://astrogeology.usgs.gov/search/map/mars_2020_science_investigation_ctx_dem_mosaic), 20 m/píxel | Jezero, centro 18.4447° N / 77.4508° E, convertido al CRS esférico de Marte del producto. |

## Reproducir

Desde la raíz con Python y uv del repositorio. Descarga los tres enlaces en `downloadUrl` de [sources.json](sources.json) a `science/cache/inputs/` conservando sus nombres; el script compara SHA-256 antes de abrirlos. La carpeta `science/cache/` se ignora en Git. La descarga lunar puede tardar varios minutos. No hay descargas en las pruebas.

~~~powershell
New-Item -ItemType Directory -Force science/cache/inputs | Out-Null
$sources = Get-Content -Raw -LiteralPath science/pipeline/sources.json | ConvertFrom-Json
foreach ($item in $sources.PSObject.Properties.Value) {
    curl.exe --fail --location --retry 2 --output "science/cache/inputs/$($item.file)" $item.downloadUrl
    if ($LASTEXITCODE -ne 0) { throw "Falló la descarga de $($item.file)" }
}
uv sync --locked
uv run --locked python -m unittest discover -s science/pipeline
uv run --locked python science/pipeline/terrain.py --preflight
uv run --locked python science/pipeline/terrain.py
~~~

Los resultados salen en `science/cache/results/`: `preflight.json` (una ventana por cuerpo), `manifest.json` (fuentes, CRS, cobertura, mediciones, hashes, parámetros y ranking completo), `analysis.preview.json` (contrato v1 para la interfaz) y `maps/`. Se pueden elegir otras rutas con `--inputs` y `--output`. Si falta un raster, no se inventan fichas ni resultados para ese cuerpo; un archivo presente con hash incorrecto detiene la ejecución.

## Medición y alcance

- Los IDs terrestres van de norte a sur y de oeste a este, `bo-r01-c01` a `bo-r05-c05`. Las ventanas son contiguas y se fijaron antes de medir a partir de los centros de [Valle](https://www.openstreetmap.org/node/2107826716) y [Cerro](https://www.openstreetmap.org/node/6789059790). OpenStreetMap se usa solo para fijar esos centros, no para obtener alturas.
- Remuestreo por promedio a 40 m (100 × 100 celdas). Si una celda de destino incluye NoData en su área de contribución, se enmascara. Excluir ventanas con menos del 95 % de celdas válidas. Pendiente Horn de 3 × 3 (mediana y P90 en grados), sin bordes ni vecinos inválidos, y relieve P95−P5 (m). Se usan elevaciones de cada producto dentro de su propia ventana.
- Mapas PNG con +Y de la cuadrícula hacia arriba; la flecha **N** indica norte geográfico local, especialmente importante en la proyección polar. La barra representa 1 km proyectado. El gris común va de −100 a +100 m respecto de la mediana del recorte; el morado indica NoData. La saturación visual está en el manifiesto y **no afecta** a las métricas. En Nobile el contraste queda saturado en 57 % del recorte con esta paleta.
- Ranking: distancia euclidiana en tres medidas, divididas por sus desviaciones estándar poblacionales de la cuadrícula terrestre válida. Omitir medidas constantes. Desempate por ID. El Cerro no entra al ajuste ni al ranking. Las distancias no son porcentajes y el más parecido de una muestra no es necesariamente un buen análogo.
- NASADEM es una superficie derivada de radar; LOLA tiene interpolación entre trazas; CTX combina pares estéreo. Cobertura de 100 % significa celdas computables, no que cada altura fue observada directamente. No comparamos altitudes absolutas entre datums, seguridad de aterrizaje, geología, clima ni recursos.
