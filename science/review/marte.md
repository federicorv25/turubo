# Ficha Tierra–Marte: Jezero

**Estado de la comparación:** `not_assessed` (14 de noviembre de 2026). Esta
ficha documenta el insumo y el método previsto; no publica una semejanza,
distancia de ranking ni una conclusión sobre habitabilidad o aterrizaje.

## Referencia marciana

| Campo | Valor verificable |
| --- | --- |
| Referencia | Jezero Crater, Marte |
| Producto de elevación | `M20_JezeroCrater_CTXDEM_20m.tif` |
| Publicador | USGS Astrogeology / PDS Geosciences Node |
| Enlace estable del producto | <https://planetarymaps.usgs.gov/mosaic/mars2020_trn/CTX/ScienceInvestigationMaps_JPL/M20_JezeroCrater_CTXDEM_20m.tif> |
| Tamaño del archivo remoto | 90,345,300 bytes (cabecera HTTP comprobada el 14 de noviembre de 2026) |
| Resolución nativa | 20 × 20 m por píxel, según las etiquetas GeoTIFF `ModelPixelScale` |
| Dimensiones | 4,456 × 5,067 píxeles; la extensión total aproximada del raster es 89.12 × 101.34 km |
| CRS en el archivo | `Jezero_Crater_Projection`; sistema geográfico `GCS_Mars_2000_Sphere`, radio 3,396,190 m. Es un CRS GeoTIFF personalizado, no un EPSG confirmado. |
| Punto de amarre del raster | Píxel superior izquierdo `(0, 0)` → `(4,328,999.999999998 m, 1,143,420.0000000028 m)` en el CRS del producto. |
| Centro para el recorte | `18.4447° N, 77.4508° E`, como fija la issue #12; debe transformarse al CRS del producto antes de extraer la ventana. |

Los valores de resolución, dimensiones, CRS y punto de amarre proceden de la
cabecera GeoTIFF pública inspeccionada el 14 de noviembre de 2026. La URL del
producto redirige a un objeto PDS/USGS; no se versiona el GeoTIFF original en
este repositorio.

## Método acordado y evidencia pendiente

La corrida reproducible de la issue #12 debe:

1. Transformar el centro de Jezero al CRS del raster y extraer una ventana de
   **4 × 4 km**.
2. Reproyectar a unidades métricas y remuestrear a la resolución común de
   **40 m**.
3. Comprobar al menos **95 %** de cobertura válida, excluyendo NoData.
4. Calcular pendiente mediana y P90 en grados, y relieve `P95 − P5` en metros.
5. Guardar el recorte, mapa derivado, manifiesto de procedencia y comando de
   reproducción antes de comparar contra las ventanas de Tierra.

Hasta que esa salida exista y sea revisada, esta ficha no afirma cobertura de
la ventana, pendientes, desnivel, candidato más cercano ni distancia. El JSON
público debe conservar `comparisons.mars.status` como `not_assessed`.

## Qué se puede comunicar en la escena de Marte

- **Hecho medido/documentado:** el panel puede identificar Jezero y enlazar el
  producto CTX DEM de USGS, indicando que se evaluará el relieve en ventanas
  comparables de 4 × 4 km.
- **No evaluado todavía:** no mostrar números de pendiente, desnivel, mapas
  derivados, ranking ni porcentaje de analogía hasta recibir la salida de #12.
- **Límite:** la comparación prevista es solo de relieve. No evalúa seguridad
  de aterrizaje, clima, composición, agua, hielo ni habitabilidad.
- **Separación narrativa:** el templo de Turubó en Marte es ficción de la
  aventura; no representa una estructura, medición ni rasgo de Jezero.

## Sitios terrestres y revisión posterior

La comparación debe mantener separados el **Valle de la Luna de San José de
Chiquitos** (catálogo de ventanas y posible ranking) y el **Cerro Turubó**
(caso guiado fuera del ranking). Tras recibir la exportación de #12, Belinda
revisará una semejanza y una diferencia con sus unidades y límites antes de
autorizar su presentación en «Ver análisis» o en la demo.

## Próximo traspaso a Federico (#12)

Esta ficha entrega el enlace directo, el centro objetivo, el CRS declarado por
el archivo y la resolución nativa. Federico debe responder con el recorte
reproducible, la cobertura válida y las métricas derivadas; si alguno no puede
obtenerse, debe quedar documentado y la comparación permanece `not_assessed`.
