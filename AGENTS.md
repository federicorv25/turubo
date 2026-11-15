# Instrucciones del repositorio TURUBO

## Antes de escribir

1. Lee este archivo y la **issue real en GitHub**: título, cuerpo y comentarios. Usa `gh issue view NUMERO --comments --repo federicorv25/turubo`, el conector GitHub o la página del issue. Si falta el número, pregunta cuál es la tarea. Si no puedes abrirla, pide el texto; el ZIP no sustituye la issue actual.
2. Confirma el remoto `federicorv25/turubo`, la cuenta activa del integrante y los archivos que le corresponden. Si falta identidad, acceso, alcance o criterio de terminado, pregunta solo lo necesario. No adivines correos, cuentas o permisos.
3. Busca PR abierto antes de duplicar trabajo. Una rama por issue; un responsable escribe en cada módulo. Revisión de otras áreas en modo lectura si el usuario la solicita. Sigue el [flujo de GitHub](docs/FLUJO_GITHUB.md).

## Estado de la tarea

- **En desarrollo:** issue con `en-curso`, PR **Draft** hacia `main`, y `Closes #NUMERO` en el cuerpo. Si aún falta el primer cambio, marca la issue y abre el Draft apenas tengas un commit útil. Comprueba el vínculo real; el número en el título no basta.
- **Ready:** relee el issue; actualiza el PR con cambios, pruebas, uso de IA y pendientes. Cuando se cumplan los criterios y pasen sus comprobaciones, cambia el PR a **Ready for review**, sustituye `en-curso` por `en-revision` y pide revisión humana. Si vuelves a trabajar, convierte a Draft y restaura `en-curso`.
- **Integrado:** solo Federico integra a `main` vía PR, después de revisar las pruebas y la aprobación en la revisión actual. No hagas push directo a `main` ni fusiones por tu cuenta. La issue vinculada se cierra al integrar su PR.

## Alcance y archivos

- **Coordinación vigente desde el 15 de noviembre:** Federico y Codex asumen #1, #11, #15, #26–#29, #31 y #32 y la revisión de todos los PR. Asael conserva #7. Lee `docs/FRONTEND_3D.md` antes de cambiar la web y no editar la rama del juego mientras Asael trabaja.
- La marca pública es **TURUBO**, el personaje **Turubó**, y el remoto canónico `federicorv25/turubo`. Conserva idioma, enlaces profundos y datos reales. El frontend y móvil deben funcionar sin esperar al juego de #7.
- Kie.ai es una herramienta local de producción de medios. Tope autorizado: **US$5 acumulados**; verificar tarifas y registrar cada job antes de crearlo. Las claves están cifradas fuera del repo. No incluir API ni secretos en la web, no recargar saldo y no repetir un job por timeout.

- Web: recorrido 3D por scroll según `docs/FRONTEND_3D.md`, galería de fotos reales y alternativas estáticas. El juego parte de la escena de Asael en Tierra y permite recorrer también Luna y Marte; la ilustración de respaldo conserva las decisiones si WebGL falla. Conserva el comparador accesible desde cualquier escena y el regreso al mismo punto.
- Separa ficción y mapas medidos. Dos sitios terrestres distintos: Valle de la Luna de San José de Chiquitos y Cerro Turubó. Referencias: Nobile Rim 1 y Jezero. Cerro Turubó es caso guiado, fuera del ranking. No inventes mediciones, conclusiones, fuentes o porcentajes de analogía.
- Los ejemplos en `fixtures/` son de desarrollo y no van a la web pública. El JSON público usa datos verificados o `not_assessed`. Guarda fuente, unidades, resolución, cobertura y límites. No subas datos personales, tokens, variables secretas, GeoTIFF completos, cachés o entornos instalados.
- Edita solo las carpetas de la issue. Federico mantiene configuración, lockfiles, contratos, CI y publicación. No integres APIs pagadas ni motores nuevos sin coordinar.

## Entrega

- Web: ejecuta `npm --prefix web run check` y `npm --prefix web run build` y prueba el flujo afectado.
- Datos: verifica esquema, unidades, fuentes y cálculo. Conserva evidencia reproducible.
- Texto/arte: revisa inglés/español, fuentes y créditos. Registra herramientas de IA y revisión humana; separa mito, adaptación y mediciones.
- Deja pruebas o limitaciones claras en el PR. Si algo bloquea la tarea, avisa y deja el estado en la issue. [INICIO.md](INICIO.md) prepara Git y GitHub CLI.
