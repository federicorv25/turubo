# Una issue, una rama y un PR vinculado

| Paso | Issue | PR |
|---|---|---|
| Empiezas | Lee la issue y aplica `en-curso`. | Abre **Draft** con el primer cambio. |
| Sigues trabajando | Mantén `en-curso`. | Actualiza el mismo Draft. |
| Cumple criterios y pruebas | Cambia a `en-revision`. | **Ready for review** y revisión humana. |
| Requiere cambios | Vuelve a `en-curso`. | Regresa a Draft. |
| Federico integra | GitHub la cierra mediante el vínculo. | Merge después de revisar. |

## Ejemplo con la issue 4

Primero lee el alcance real, revisa que no exista otro PR y confirma tu rama:

~~~powershell
gh issue view 4 --comments
gh pr list --state open
git switch main
git pull --ff-only
git switch -c issue-4-guion
gh issue edit 4 --add-label en-curso
~~~

Con el primer commit útil, revisa tu diff y sube la rama:

~~~powershell
git push -u origin issue-4-guion
gh pr create --base main --draft --title "Guion y personajes" --body "Closes #4"
~~~

El PR debe incluir `Closes #4` **en el cuerpo** y apuntar a `main`. Añade alcance, pruebas, uso de IA y lo que falta. Confirma el enlace en **Development** o con `gh pr view NUMERO_PR --json isDraft,closingIssuesReferences,url`. Si el cambio solo cubre una parte de la issue, sigue en Draft o acuerda un issue separado con Federico; no cierres trabajo pendiente.

## Pasar a revisión

Relee la issue y sus comentarios, comprueba los criterios, ejecuta las pruebas y revisa la descripción. Cuando el responsable confirme que está listo:

~~~powershell
gh pr ready NUMERO_PR
gh issue edit 4 --remove-label en-curso --add-label en-revision
gh pr view NUMERO_PR --json isDraft,closingIssuesReferences,url
~~~

Si vuelves a desarrollar, `gh pr ready NUMERO_PR --undo` y restaura la etiqueta `en-curso`. En GitHub web puedes hacer las mismas acciones: etiqueta en la issue, Draft o Ready en el PR. [Vincular PR e issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue) · [GitHub CLI Ready](https://cli.github.com/manual/gh_pr_ready).
