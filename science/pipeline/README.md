# Procesamiento del terreno

Área para leer, recortar y comparar los modelos de elevación. Trabaja desde la [issue de datos](https://github.com/federicorv25/turubo-atlas/issues/3) y acuerda el alcance con Federico.

| Cuerpo | Producto de partida | Lugar |
|---|---|---|
| Tierra | [NASADEM HGT](https://doi.org/10.5067/MEASURES/NASADEM/NASADEM_HGT.001) | Valle de la Luna de San José de Chiquitos: cuadrícula fija 5×5; Cerro Turubó: recorte guiado separado. |
| Luna | [LRO/LOLA, Site 06](https://pgda.gsfc.nasa.gov/products/78) | Nobile Rim 1. |
| Marte | [Jezero CTX DEM, USGS](https://planetarymaps.usgs.gov/mosaic/mars2020_trn/CTX/ScienceInvestigationMaps_JPL/M20_JezeroCrater_CTXDEM_20m.tif) | Jezero. |

Comprobar cobertura, referencias, proyección y unidades de origen. Comparar ventanas de **4 × 4 km** con resolución común de **40 m**. Excluir recortes con menos de **95 %** de cobertura válida. Exportar pendiente mediana y P90 en grados, y relieve P95−P5 en metros, además de los mapas y su procedencia. Verificar las métricas con controles sencillos y en un recorte real por cuerpo antes de procesar el catálogo. No subir archivos originales pesados, y no anunciar resultados hasta revisarlos.
