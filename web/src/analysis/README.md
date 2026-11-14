# Panel «Ver análisis»

Comparador Tierra–Luna y Tierra–Marte para TURUBO. Solo edita archivos en esta carpeta (y `analysis.css` importado desde `index.ts`).

## Comportamiento

| Pestaña | Datos | Vista |
|--------|--------|--------|
| Tierra | `terrains` con `body: earth` | Tarjetas de sitios bolivianos |
| Luna / Marte | `comparisons.*.status === 'reviewed'` | Referencia + candidato en columnas (≥720px) o apilado |
| Luna / Marte | `not_assessed` o JSON simulado | «No evaluado» / pendiente |

- Ranking: orden y `distance` se leen del JSON; no se recalculan en la UI.
- `guidedId` (p. ej. Cerro Turubó) se muestra aparte, sin posición en el ranking.
- Mapas: rutas bajo `maps/` validadas; si falta imagen, se muestran métricas y fuente.

## Prueba local

1. `npm --prefix web run dev` y abrir `http://127.0.0.1:5173/`.
2. En la historia, **Ver análisis**; probar Tierra / Luna / Marte, ES/EN y **Volver a la historia** (el viaje conserva escena y elección).
3. Con datos verificados de integración ([#9](https://github.com/federicorv25/turubo-atlas/issues/9) / pipeline [#12](https://github.com/federicorv25/turubo-atlas/issues/12)), sustituir temporalmente `web/public/data/analysis.json` (`simulated: false`). **No commitear fixtures ni ejemplos simulados.**

El layout `reviewed` (columnas, candidatos, Turubó guiado) solo se puede capturar con ese JSON revisado; hasta entonces el estado «No evaluado» es el esperado en producción.

## Comprobaciones de entrega

```powershell
npm --prefix web run check
npm --prefix web run build
```