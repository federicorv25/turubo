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
3. Para QA del panel con mediciones reales sin publicar: copiar el **paquete de prueba** `science/pipeline/preview/analysis.preview.json` → `web/public/data/analysis.json` y `science/pipeline/preview/maps/*.png` → `web/public/maps/` (ver [README del pipeline](../../../science/pipeline/README.md#traspaso-al-equipo)). **No commitear** esos archivos.

   Ese JSON es solo para probar la interfaz en local. El `status: reviewed` del preview **activa la vista** (columnas, candidatos, Turubó guiado), pero **no** significa que las comparaciones de Luna o Marte estén aprobadas para publicación. La revisión científica y el `web/public/data/analysis.json` definitivo son [#9](https://github.com/federicorv25/turubo-atlas/issues/9) (Federico).

En la web publicada, sin integración #9, el estado «No evaluado» es el esperado.

## Comprobaciones de entrega

```powershell
npm --prefix web run check
npm --prefix web run build
```