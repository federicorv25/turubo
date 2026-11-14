# Contratos de integración

- Narrativa: `content/story.json`, con textos completos en `es` y `en`, orden de escenas y destinos válidos. Las decisiones cambian la historia, no el análisis.
- Análisis: `web/src/app/contracts.ts` y `schema/analysis.schema.json`. `web/public/data/analysis.json` mantiene `not_assessed` mientras falte evidencia. Agregar datos verdaderos y revisar las fuentes antes de cambiar el estado.
- Ejemplo separado en `fixtures/analysis.example.json`; nunca copiarlo al sitio. La validación de contenido rechaza valores simulados en el archivo publicable.
- Mallas para 3D, CRS, coordenadas, recortes, máscara y manifest de fuentes se incorporan con el equipo de datos. Mantener procedencia detallada junto al pipeline, aunque el visor inicial no la consuma todavía.
