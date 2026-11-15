# Fotografías y material científico para TURUBO

Recursos incluidos en el recorrido de TURUBO. El contexto visual se mantiene separado del recorte usado en los cálculos. El [manifiesto de medios](media-manifest.json) registra binario de origen, versiones locales, dimensiones, bytes y SHA-256.

| Uso | Fuente original | Autor/crédito y uso |
|---|---|---|
| Cerro Turubó, foto real | [Cerro Turubó — San José de Chiquitos](https://commons.wikimedia.org/wiki/File:Cerro_Turub%C3%B3_-_San_Jos%C3%A9_de_Chiquitos,_Bolivia.jpg) | Ruditaly, foto de 13/02/2025; CC BY-SA 4.0. [Licencia](https://creativecommons.org/licenses/by-sa/4.0/). Atribuir y marcar recortes; las versiones transformadas conservan licencia compatible. |
| Valle de la Luna de San José, referencia del lugar | [Imagen del Niño Jesús en la montaña del Valle de la Luna de San José de Chiquitos](https://commons.wikimedia.org/wiki/File:Imagen_del_Ni%C3%B1o_Jes%C3%BAs_en_la_monta%C3%B1a_del_Valle_de_la_luna_de_San_Jos%C3%A9_de_Chiquitos.jpg) | Aldrihe, 08/02/2024, CC BY-SA 4.0. Foto vertical y con una figura religiosa: usarla como referencia documental del sitio, no recortarla para fingir un paisaje distinto. Si no sirve para hero, usar imagen orbital verificable del mismo lugar. |
| Región lunar de Nobile | [NASA VIPER Lunar Operations](https://science.nasa.gov/mission/viper/lunar-operations/) | NASA; composición/reconstrucción de relieve a partir de 147 imágenes LRO de una meseta sobre Nobile. **No es una fotografía de superficie ni acredita ser Nobile Rim 1/Site06.** Rotular contexto regional y reconstrucción. Para el recorte preciso usar nuestro mapa medido LRO/LOLA. |
| Jezero real | [PIA24921: Detailed Panorama of Mars' Jezero Crater Delta](https://science.nasa.gov/photojournal/detailed-panorama-of-mars-jezero-crater-delta/) | NASA/JPL-Caltech/ASU/MSSS, imágenes Mastcam-Z de junio de 2022. Mosaico de color realzado y versión de color natural; elegir y rotular cuál. Es contexto de Jezero, no una foto del recorte del DEM. [Política de imágenes JPL](https://www.jpl.nasa.gov/jpl-image-use-policy/). |
| Textura global lunar y vista estática | [NASA SVS CGI Moon Kit](https://svs.gsfc.nasa.gov/4720/) | NASA/GSFC/SVS, Ernie Wright y equipo LROC. Mosaico global LROC para visualizar el globo, sin relación con la escala del recorte. [Uso de medios SVS](https://svs.gsfc.nasa.gov/help/). |
| Textura global de Marte y vista estática | [NASA Mars Image Texture](https://science.nasa.gov/3d-resources/mars/) | NASA/JPL-Caltech; imágenes Viking procesadas por USGS. Visualización global, no el DEM de Jezero. |

## Cómo incorporar los archivos

`uv run --locked python scripts/fetch-visuals.py` conserva las descargas en `science/cache/visual-originals/` (ignorado por Git) y prepara WebP con tamaños adecuados al original. Las fotos de Wikimedia conservan CC BY-SA 4.0 también en las versiones reducidas; se cambiaron tamaño y formato, y la web encuadra el Cerro para la composición. La imagen NASA del delta es la versión de color realzado. No se aplicó IA a ninguna fuente de evidencia. Acreditamos imágenes NASA/JPL conforme a sus políticas, sin marcas ni afirmación de aval.

La foto real del Valle no se sustituye por las formaciones de La Paz, el Salar de Uyuni o Atacama. Si se usa un mosaico orbital del valle, decir «imagen satelital», fuente/producto y ubicación. La posición del mirador no prueba que cada foto corresponda a una ventana científica.

## Arte narrativo

La portada nocturna y la ilustración del viajero son ficciones generadas con Seedream 5.0 Pro mediante Kie.ai. Ambas llevan una marca visible en la web; no sustituyen fotografías ni mapas. [Registro de arte](ai-art-manifest.json). El emblema propio y arte vectorial de la aventura cuentan con asistencia de Codex. No se reutilizó el emblema previo al evento.
