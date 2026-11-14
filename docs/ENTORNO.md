# Preparar el entorno en Windows

## 1. Detectar qué tienes

Desde el ZIP o el clon, en PowerShell:

~~~powershell
.\scripts\check-env.cmd web
~~~

Usa `web`, `datos` o `contenido` según tu issue. La comprobación no instala ni muestra tu correo o token. Los textos se pueden editar desde el navegador; el equipo web y de datos usan Git y GitHub CLI en su equipo.

## 2. Instalar solo lo necesario

El asistente primero comprueba qué falta y confirma qué va a instalar. No igualar por la fuerza las versiones de Git y `gh`, ni desinstalar herramientas que la persona ya use. Node **26.13.1**, npm **12.2.2**, Python **3.15.2**, uv **0.13.6** son las versiones del proyecto.

~~~powershell
# Git y GitHub CLI, si faltan
winget install --id Git.Git --exact --source winget
winget install --id GitHub.cli --exact --source winget

# Solo web
winget install --id OpenJS.NodeJS.LTS --exact --version 26.13.1 --source winget

# Solo datos
winget install --id Python.Python.3.15 --exact --version 3.15.2 --source winget
winget install --id astral-sh.uv --exact --version 0.13.6 --source winget
~~~

Usa solo los comandos de tu área. Si falta esa versión o Windows pide permiso, el asistente explica la alternativa y pregunta antes de sustituir otras instalaciones. Reinicia la terminal y repite la comprobación. En macOS o Linux, usa los comandos `git --version`, `gh --version`, `node --version`, `npm --version`, `python --version` y `uv --version` que correspondan, y pide al asistente los pasos para tu equipo.

## 3. Sesión de GitHub CLI

1. Acepta la invitación con tu cuenta. Si el correo invitado no coincide, revisa en GitHub qué correo está verificado.
2. Comprueba `gh auth status --hostname github.com` y `gh api user --jq .login`. Si no hay sesión:

   ~~~powershell
   gh auth login --hostname github.com --git-protocol https --web
   ~~~

   Tú autorizas en el navegador. No pegues contraseñas, códigos ni tokens en el chat. Si hay una cuenta equivocada, el asistente pregunta cuál usar antes de cambiarla.
3. Conserva Git Credential Manager si ya funciona. Si necesitas que Git use la sesión de `gh` para HTTPS, `gh auth setup-git --hostname github.com` es opcional y cambia el helper de esa cuenta del equipo; confirma ese ajuste antes. [Login](https://cli.github.com/manual/gh_auth_login) · [Configurar el helper](https://cli.github.com/manual/gh_auth_setup-git).

## 4. Clon e identidad de cada integrante

Desde una carpeta aparte del ZIP:

~~~powershell
gh repo clone federicorv25/turubo-atlas
Set-Location turubo-atlas
git remote -v
gh repo view --json nameWithOwner,viewerPermission
~~~

El asistente pide tu nombre y el correo de commits. Usa el correo verificado asociado a tu cuenta, o tu correo privado `noreply` que aparece en **Settings → Emails**. Sustituye los ejemplos en **este clon**:

~~~powershell
git config --local user.name "TU NOMBRE"
git config --local user.email "TU CORREO VERIFICADO O NOREPLY"
git config --local pull.rebase false
~~~

La sesión de `gh` autoriza operaciones; `user.email` identifica la autoría pública. No copies el correo, las claves ni las configuraciones globales de Federico. [Correo de commits](https://docs.github.com/en/account-and-profile/how-tos/email-preferences/setting-your-commit-email-address).

## 5. Dependencias y prueba

**Web:**

~~~powershell
npm --prefix web ci
npm --prefix web run check
npm --prefix web run build
npm --prefix web run dev
~~~

**Datos:**

~~~powershell
uv sync --locked --python 3.15.2
uv run --locked python -c "import rasterio, pyproj, numpy, PIL; print('Dependencias de datos OK')"
~~~

TypeScript/Vite se instalan con `npm ci`. El 3D puede añadir Three.js más adelante, con revisión de Federico. Contenido puede empezar con Markdown desde GitHub sin Node ni Python; coordina una comprobación web al cambiar el guion.

Mientras el PR de arranque no esté en `main`, puedes **probar el ZIP** o revisar ese PR. No copies el ZIP entero encima de tu clon. Abre las ramas de tareas desde `main` actualizada cuando Federico integre la base.
