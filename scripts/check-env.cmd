@echo off
setlocal
set "AREA=%~1"
if "%AREA%"=="" set "AREA=web"
if /i "%AREA%"=="web" goto check
if /i "%AREA%"=="datos" goto check
if /i "%AREA%"=="contenido" goto check
if /i "%AREA%"=="todo" goto check
echo Uso: scripts\check-env.cmd web ^| datos ^| contenido ^| todo
exit /b 2

:check
set "PENDIENTE=0"
call :version git
call :version gh
if /i "%AREA%"=="web" call :web
if /i "%AREA%"=="datos" call :datos
if /i "%AREA%"=="todo" call :web
if /i "%AREA%"=="todo" call :datos

where gh >nul 2>&1
if not errorlevel 1 call :github
if exist "%~dp0..\.git" (
    where git >nul 2>&1
    if not errorlevel 1 call :identity
) else (
    echo [INFO] Copia del ZIP. Clona turubo-atlas aparte para trabajar y hacer PR.
)

if "%PENDIENTE%"=="1" (
    echo Revisa los puntos anteriores con tu asistente. Consulta docs\ENTORNO.md.
    exit /b 1
)
echo Entorno comprobado para %AREA%.
exit /b 0

:web
call :version node 26.13.1
call :version npm 12.2.2
exit /b 0

:datos
call :version python 3.15.2
call :version uv 0.13.6
exit /b 0

:version
where %~1 >nul 2>&1
if errorlevel 1 (
    echo [FALTA] %~1
    set "PENDIENTE=1"
    exit /b 0
)
if "%~2"=="" (
    call %~1 --version
    if errorlevel 1 set "PENDIENTE=1"
    exit /b 0
)
call %~1 --version 2>nul | findstr /l /c:"%~2"
if errorlevel 1 (
    echo [REVISAR] %~1: se necesita %~2. Version encontrada:
    call %~1 --version
    set "PENDIENTE=1"
)
exit /b 0

:github
echo Cuenta activa en GitHub:
gh api --hostname github.com user --jq .login 2>nul
if errorlevel 1 (
    echo [REVISAR] Inicia sesion con tu cuenta. Consulta docs\ENTORNO.md.
    set "PENDIENTE=1"
    exit /b 0
)
set "PUSH_ACCESS="
for /f "delims=" %%P in ('gh api --hostname github.com repos/federicorv25/turubo-atlas --jq .permissions.push 2^>nul') do set "PUSH_ACCESS=%%P"
if not "%PUSH_ACCESS%"=="true" (
    echo [REVISAR] Confirma la cuenta y acepta la invitacion antes de subir ramas.
    set "PENDIENTE=1"
) else (
    echo [OK] La cuenta puede subir ramas a turubo-atlas.
)
exit /b 0

:identity
git -C "%~dp0.." config --local --get user.name >nul 2>&1
if errorlevel 1 (
    echo [REVISAR] Falta user.name en el clon.
    set "PENDIENTE=1"
)
git -C "%~dp0.." config --local --get user.email >nul 2>&1
if errorlevel 1 (
    echo [REVISAR] Falta user.email en el clon.
    set "PENDIENTE=1"
)
exit /b 0
