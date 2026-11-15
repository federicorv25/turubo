# Revisión Tierra–Luna: Nobile Rim 1 y Valle de la Luna

**Issue:** [#3](https://github.com/federicorv25/turubo-atlas/issues/3)
**Estado de esta ficha:** revisión de Luciana preparada sobre el paquete técnico integrado en #12; requiere revisión humana antes de publicar en la experiencia.
**Alcance:** comparación topográfica exploratoria. No evalúa seguridad de aterrizaje ni selecciona un sitio lunar.

## Resultado que puede comunicarse

La ventana terrestre R03 C01 es la primera entre las 25 ventanas del Valle de la Luna de San José de Chiquitos en el ranking de similitud de #12, pero sus métricas muestran diferencias importantes respecto de Nobile Rim 1. La pendiente mediana de Nobile (14,70°) es aproximadamente el doble que la de R03 C01 (7,16°); su relieve P95−P5 (624,61 m) es 2,72 veces mayor (R03 C01: 229,61 m). Como comparación puntual, la pendiente P90 de R03 C01 (14,54°) se aproxima a la mediana de Nobile (14,70°), aunque son percentiles distintos y no demuestran que las distribuciones sean similares. El relieve lunar medido en esta ventana es mucho mayor; el ranking no implica equivalencia de terreno.

El Cerro Turubó es un ejemplo terrestre guiado y se mantiene fuera de la cuadrícula y del ranking. Su relieve (119,12 m) es menor que el de R03 C01 y Nobile; la pendiente mediana es 2,15° y la P90, 13,56°. Mostrarlo por separado evita presentarlo como candidato ganador o como análogo lunar.

| Ventana de 4 × 4 km | Rol | Pendiente mediana (°) | Pendiente P90 (°) | Relieve P95−P5 (m) | Cobertura válida |
|---|---|---:|---:|---:|---:|
| Nobile Rim 1 (`moon-nobile-rim-1`) | Referencia lunar | 14,70 | 21,67 | 624,61 | 100 % |
| Valle de la Luna R03 C01 (`bo-r03-c01`) | Primera ventana del ranking terrestre | 7,16 | 14,54 | 229,61 | 100 % |
| Cerro Turubó (`bo-cerro-turubo`) | Caso guiado, fuera del ranking | 2,15 | 13,56 | 119,12 | 100 % |

Las tres ventanas se remuestrearon a una cuadrícula de análisis de 40 m (100 × 100 celdas). Se calculó pendiente con Horn 3 × 3, sin bordes ni vecinos inválidos, y relieve como P95−P5 de elevación. La cobertura del 100 % significa que todas las celdas del recorte son computables bajo este procesamiento; no significa que cada altura lunar tenga una medición LOLA directa. La lista de candidatos y el método de ranking son los definidos en [la documentación de #12](../pipeline/README.md).

## Fuentes y procedencia

- **Luna:** NASA GSFC Planetary Geodesy Data Archive, [LRO/LOLA High-Resolution Topography for Lunar South Pole Sites](https://pgda.gsfc.nasa.gov/products/78), Site06, Nobile Rim 1, archivo `Site06_final_adj_5mpp_surf.tif`. DEM de superficie de 5 m/píxel, alturas en metros, coordenadas X/Y de proyección estereográfica polar sur, marco MOON_ME (DE421). DOI no indicado en la ficha del producto. Hash SHA-256 del raster empleado: `cca17e8067601dd659b583f889204db6bce685bc30c60a9e62427a8bce36b03d`.
- **Tierra:** NASADEM Merged DEM Global 1 arc second V001, tesela `s18w061`, [DOI del producto](https://doi.org/10.5067/MEASURES/NASADEM/NASADEM_HGT.001), distribuido por [OpenTopography](https://portal.opentopography.org/datasetMetadata?otCollectionID=OT.032021.4326.2). Elevaciones en metros referidas a EGM96; el producto derivado de radar puede incluir vegetación o estructuras y no es un levantamiento de roca desnuda. Hash SHA-256 del raster empleado: `2167f354026d11e1455bbe4f885a48e0efe737d6ee969ce54a74732619681e73`.
- **Manifiesto de procedencia y resultados:** [`manifest.json`](../pipeline/preview/manifest.json). Contiene CRS de origen/destino, coordenadas, límites, cobertura, método y hashes de los mapas.
- **Mapas revisados:** [Nobile Rim 1](../pipeline/preview/maps/moon-nobile-rim-1.png), [R03 C01](../pipeline/preview/maps/bo-r03-c01.png) y [Cerro Turubó](../pipeline/preview/maps/bo-cerro-turubo.png). Muestran elevación relativa en gris, centrada en la mediana y recortada al intervalo −100 a +100 m; no son mapas de sombreado. En Nobile se satura visualmente el 57 % del recorte. La saturación afecta solo la visualización, no las métricas.

## Límites de interpretación

1. NASA indica que aproximadamente el 90 % de los píxeles de estos LDEM polares de 5 m están interpolados por el espaciado entre trazas y puntos de LOLA. Por eso, la resolución nominal de 5 m no equivale a una observación independiente cada 5 m, y una ventana computable al 100 % no elimina la incertidumbre de interpolación. El producto proporciona mapas de incertidumbre de altura y pendiente, pero el resumen comparativo aquí no propaga esas incertidumbres a las métricas de 40 m.
2. NASADEM es una superficie derivada de radar y puede reflejar vegetación o estructuras; la comparación no caracteriza únicamente roca expuesta.
3. Los dos productos representan superficies y marcos de referencia distintos. Se comparan estadísticas de pendiente y relieve dentro de ventanas proyectadas independientes, no altitudes absolutas.
4. La ventana R03 C01 es la más parecida solo dentro de la muestra y con la distancia normalizada definida por #12. El ranking no es una probabilidad ni un porcentaje de analogía, y no demuestra equivalencia geológica.
5. No se evalúan iluminación, temperatura, volátiles/hielo, composición, recursos, comunicaciones, acceso, ingeniería ni riesgo de aterrizaje. Nobile Rim 1 es una referencia de datos del producto, no una recomendación de emplazamiento para una base.

## Uso recomendado en escena y «Ver análisis»

- En la escena lunar, presentar Nobile Rim 1 como referencia topográfica de NASA LRO/LOLA y enlazar la fuente. Identificar R03 C01 como la primera ventana terrestre del ranking, acompañada por las diferencias numéricas de pendiente y relieve.
- Mostrar Cerro Turubó como caso guiado independiente, sin puesto en el ranking.
- En «Ver análisis», conservar unidades, ventana de 4 × 4 km, paso de análisis de 40 m, fuente y la advertencia sobre interpolación de LOLA. La comparación debe etiquetarse como parcial y exploratoria.
- Mantener el resultado en el paquete de revisión de #12 hasta que Federico publique los datos revisados mediante #9. Esta ficha no autoriza ni realiza cambios a `web/public/data/analysis.json`.

### Texto breve para la interfaz

**ES:** «La ventana R03 C01 del Valle de la Luna es la más parecida de esta muestra a Nobile Rim 1 según el método del proyecto. Aun así, Nobile presenta mayor pendiente mediana (14,70° frente a 7,16°) y aproximadamente 2,72 veces el relieve (624,61 m frente a 229,61 m). El DEM lunar de 5 m incluye una alta proporción de píxeles interpolados; esta comparación topográfica no evalúa seguridad ni habitabilidad.»

**EN:** “Among the sampled Valle de la Luna windows, R03 C01 is the closest to Nobile Rim 1 under the project’s method. Even so, Nobile has a higher median slope (14.70° vs. 7.16°) and about 2.72 times the relief (624.61 m vs. 229.61 m). The 5 m lunar DEM contains a high proportion of interpolated pixels; this topographic comparison does not assess safety or habitability.”

## Referencias reproducibles

- Análisis de vista previa: [`analysis.preview.json`](../pipeline/preview/analysis.preview.json), `comparisons.moon` y fichas `moon-nobile-rim-1`, `bo-r03-c01`, `bo-cerro-turubo`.
- Método y sistema de clasificación: [`science/pipeline/README.md`](../pipeline/README.md).
- Producto LOLA y descripción del porcentaje interpolado: [NASA GSFC PGDA, High-Resolution LOLA Topography for Lunar South Pole Sites](https://pgda.gsfc.nasa.gov/products/78).

**Uso de IA y revisión:** OpenAI Codex asistió en la síntesis y redacción de esta ficha usando el manifiesto integrado, la documentación del pipeline y la ficha NASA enlazada. Revisión humana de los cálculos e interpretación pendiente antes de marcar la issue como lista para publicación.
