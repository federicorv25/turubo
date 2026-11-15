# Ficha Tierra–Marte: Jezero

**Estado de la comparación:** revisión de Belinda sobre el paquete técnico de
la [issue #12](https://github.com/federicorv25/turubo/pull/19), 14 de
noviembre de 2026. La publicación web permanece a cargo de #9; hasta entonces,
el JSON público conserva `not_assessed`.

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

## Método y evidencia revisada

La corrida reproducible de #12 ya:

1. Transformó el centro de Jezero al CRS del raster y extrajo una ventana de
   **4 × 4 km**.
2. Remuestreó a la resolución común de
   **40 m**.
3. Comprobó **100 %** de cobertura válida: 10 000 de 10 000 celdas en la
   ventana de Jezero y en R02 C02.
4. Calculó pendiente mediana y P90 en grados, y relieve `P95 − P5` en metros.
5. Exportó mapas derivados, manifiesto de procedencia, hashes y un comando de
   reproducción. El PR #19 informa controles de NoData, remuestreo, cuadrícula
   y ranking, además de una segunda corrida que reprodujo los derivados.

El método ordena las 25 ventanas válidas del Valle por distancia euclidiana de
pendiente mediana, P90 y relieve, normalizadas por la desviación estándar de la
cuadrícula terrestre. Esa distancia no es un porcentaje ni certifica un análogo
para una misión. El Cerro no entra al ranking.

## Resultado revisado: Jezero y Valle de la Luna R02 C02

| Medida a 40 m | Jezero | Valle de la Luna · R02 C02 |
| --- | ---: | ---: |
| Cobertura válida | 100 % | 100 % |
| Pendiente mediana | 2.11° | 1.64° |
| Pendiente P90 | 4.41° | 3.41° |
| Relieve P95−P5 | 77.56 m | 63.38 m |
| Distancia estandarizada | Referencia | 0.3851 |

R02 C02 ocupa el primer lugar de esta cuadrícula por el método documentado.
R05 C02 queda casi empatada, con distancia 0.3905; por ello la presentación no
debe describir R02 C02 como un análogo validado ni como un resultado único.

**Semejanza medible:** las pendientes medianas son bajas y cercanas en la
ventana comparada: 2.11° en Jezero y 1.64° en R02 C02.

**Diferencia medible:** Jezero tiene mayor pendiente P90 (4.41° frente a
3.41°) y 14.18 m más de relieve P95−P5 (77.56 m frente a 63.38 m).

## Qué se puede comunicar en la escena de Marte

- **Hecho medido/documentado:** al publicar #9 el panel puede mostrar Jezero y
  R02 C02 con sus mapas derivados a la misma escala, fuente, cobertura, 40 m
  de resolución de análisis, las métricas de la tabla y la distancia 0.3851.
- **Caso guiado:** el Cerro Turubó se muestra separado. Tiene pendiente mediana
  de 2.15°, P90 de 13.56° y relieve P95−P5 de 119.12 m, frente a 4.41° P90 y
  77.56 m de relieve en Jezero; no recibe puesto ni distancia de ranking. El
  [manifiesto integrado de #12](https://github.com/federicorv25/turubo/blob/6d6111179c1580c3932b383ce8a1da3dc21c0781/science/pipeline/preview/manifest.json)
  conserva la procedencia y los mapas de ambas ventanas.
- **Límite:** la comparación prevista es solo de relieve. No evalúa seguridad
  de aterrizaje, clima, composición, agua, hielo ni habitabilidad.
- **Separación narrativa:** el templo de Turubó en Marte es ficción de la
  aventura; no representa una estructura, medición ni rasgo de Jezero.

## Sitios terrestres y revisión posterior

La comparación mantiene separados el **Valle de la Luna de San José de
Chiquitos** (catálogo de ventanas y ranking) y el **Cerro Turubó** (caso guiado
fuera del ranking). Esta revisión autoriza las frases y cifras anteriores para
la integración de #9, siempre con sus fuentes, unidades y límites.

## Traspaso a Federico (#9)

#9 debe construir `web/public/data/analysis.json` con los resultados aprobados
de Marte, los mapas de Jezero y R02 C02 y enlaces al manifiesto o a sus fuentes.
Debe conservar `comparisons.moon.status` como `not_assessed`, con ranking vacío,
hasta que #3 complete su revisión, y no publicar el marcador técnico
`analysis.preview.json`. La interfaz debe explicar que el resultado compara solo
relieve. Belinda usará capturas de esa versión estable en la demo de #11.
