# Comparaciones de terreno · #12

Este módulo transforma los tres DEM originales en ventanas comparables para TURUBO Atlas. La carpeta [preview/](preview/) contiene **datos calculados y verificables, pendientes de revisión del equipo para publicar**. En la web estable, la carga de resultados es trabajo de [#9](https://github.com/federicorv25/turubo/issues/9).

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

Para inspeccionar el recorte numérico, agrega `--export-grids` al comando. Por ejemplo, `grids/mars-jezero.npy` contiene una matriz de 100 × 100 elevaciones en metros; leer con `numpy.load(..., allow_pickle=False)`. La esquina superior izquierda y el tamaño de celda se obtienen de `windows.mars-jezero.boundsM` y `method.resolutionM` del manifiesto; la columna crece hacia +X y la fila hacia −Y. Estas matrices son derivados locales y no se suben al repo.

## Traspaso al equipo

- **Belinda (#8 / PR #20):** el centro de Jezero queda en 4 354 489,266 E / 1 093 304,013 N (m) del CRS del producto. Su ventana tiene 10 000 celdas válidas de 10 000. Usa [el mapa de Jezero](preview/maps/mars-jezero.png), [el primer candidato R02 C02](preview/maps/bo-r02-c02.png) y las entradas `mars-jezero` y `bo-r02-c02` del [manifiesto](preview/manifest.json). Las pendientes medianas son 2,11° y 1,64°; los relieves P95−P5 son 77,56 m y 63,38 m. R02 C02 y R05 C02 quedan casi empatados por este método (distancias 0,3851 y 0,3905). El Cerro tiene pendiente mediana de 2,15° pero P90 de 13,56° frente a 4,41° en Jezero; se muestra por separado.
- **Luciana (#3 / #15):** para Nobile, comparar [el mapa lunar](preview/maps/moon-nobile-rim-1.png) con [R03 C01](preview/maps/bo-r03-c01.png). Aun siendo la primera de la cuadrícula, la ventana boliviana tiene aprox. 230 m de relieve frente a 625 m en Nobile. Revisar la evidencia y dejar explícita esa diferencia en la ficha. Los productos, citas y hashes reales están en el [manifiesto](preview/manifest.json).
- **Erick (#14 / PR #17):** para validar el recorrido sin descargar los GeoTIFF, en una copia local aparte de la web coloca `analysis.preview.json` como `web/public/data/analysis.json` y copia `maps/` a `web/public/maps/`. Corre `npm --prefix web run check` y `npm --prefix web run build`. El valor `resolutionM` es el paso **de análisis** de 40 m; las resoluciones de origen (1 arco de segundo, 5 m y 20 m) están separadas en el manifiesto. Los mapas son elevaciones relativas en gris, no sombreado de relieve. Activa `reviewed` en esta copia solo para comprobar el panel; la revisión de resultados y su publicación son parte del cierre de #3, #8 y #9.

## Medición y alcance

- Los IDs terrestres van de norte a sur y de oeste a este, `bo-r01-c01` a `bo-r05-c05`. Las ventanas son contiguas y se fijaron antes de medir a partir de los centros de [Valle](https://www.openstreetmap.org/node/2107826716) y [Cerro](https://www.openstreetmap.org/node/6789059790). OpenStreetMap se usa solo para fijar esos centros, no para obtener alturas.
- Remuestreo por promedio a 40 m (100 × 100 celdas). Si una celda de destino incluye NoData en su área de contribución, se enmascara. Excluir ventanas con menos del 95 % de celdas válidas. Pendiente Horn de 3 × 3 (mediana y P90 en grados), sin bordes ni vecinos inválidos, y relieve P95−P5 (m). Se usan elevaciones de cada producto dentro de su propia ventana.
- Mapas PNG con +Y de la cuadrícula hacia arriba; la flecha **N** indica norte geográfico local, especialmente importante en la proyección polar. La barra representa 1 km proyectado. El gris común va de −100 a +100 m respecto de la mediana del recorte; el morado indica NoData. La saturación visual está en el manifiesto y **no afecta** a las métricas. En Nobile el contraste queda saturado en 57 % del recorte con esta paleta.
- Ranking: distancia euclidiana en tres medidas, divididas por sus desviaciones estándar poblacionales de la cuadrícula terrestre válida. Omitir medidas constantes. Desempate por ID. El Cerro no entra al ajuste ni al ranking. Las distancias no son porcentajes y el más parecido de una muestra no es necesariamente un buen análogo.
- NASADEM es una superficie derivada de radar; LOLA tiene interpolación entre trazas; CTX combina pares estéreo. Cobertura de 100 % significa celdas computables, no que cada altura fue observada directamente. No comparamos altitudes absolutas entre datums, seguridad de aterrizaje, geología, clima ni recursos.
