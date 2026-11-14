[CmdletBinding()]
param(
    [ValidateSet('web','datos','contenido','todo')]
    [string]$Area = 'web'
)

$ErrorActionPreference = 'Stop'
$required = @('git', 'gh')
if ($Area -in @('web','todo')) { $required += @('node','npm') }
if ($Area -in @('datos','todo')) { $required += @('python','uv') }

$versions = @{
    node = '26.13.1'
    npm = '12.2.2'
    python = '3.15.2'
    uv = '0.13.6'
}
$pending = 0
foreach ($tool in $required) {
    $path = Get-Command $tool -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $path) {
        Write-Output "[FALTA] $tool"
        $pending++
        continue
    }
    $versionOutput = & $path.Source --version 2>$null | Select-Object -First 1
    if ($LASTEXITCODE -ne 0 -or -not $versionOutput) {
        Write-Output "[REVISAR] $tool no respondió"
        $pending++
    } elseif ($versions.ContainsKey($tool) -and $versionOutput -notmatch ('(?<![\d.])' + [regex]::Escape($versions[$tool]) + '(?![\d.])')) {
        Write-Output "[REVISAR] $tool : $versionOutput (esperado $($versions[$tool]))"
        $pending++
    } else {
        Write-Output "[OK] $versionOutput"
    }
}

if (Get-Command gh -CommandType Application -ErrorAction SilentlyContinue) {
    # Only display the login and permission, never the token or commit email.
    $login = & gh api --hostname github.com user --jq .login 2>$null
    if ($LASTEXITCODE -eq 0 -and $login) {
        Write-Output "[OK] Sesión GitHub: $login"
        $permission = & gh api --hostname github.com repos/federicorv25/turubo-atlas --jq '.permissions.push // false' 2>$null
        if ($LASTEXITCODE -eq 0 -and $permission -eq 'true') {
            Write-Output "[OK] La cuenta puede subir ramas a turubo-atlas"
        } else {
            Write-Output "[REVISAR] Confirma la cuenta y acepta la invitación antes del push"
            $pending++
        }
    } else {
        Write-Output "[REVISAR] Inicia sesión con tu cuenta según docs/ENTORNO.md"
        $pending++
    }
}

$root = Split-Path -Parent $PSScriptRoot
if (Test-Path -LiteralPath (Join-Path $root '.git')) {
    if (Get-Command git -CommandType Application -ErrorAction SilentlyContinue) {
        foreach ($field in @('user.name','user.email')) {
            $configured = & git -C $root config --local --get $field 2>$null
            if ($LASTEXITCODE -eq 0 -and $configured) {
                Write-Output "[OK] $field está configurado en el clon"
            } else {
                Write-Output "[REVISAR] Configura $field en el clon según docs/ENTORNO.md"
                $pending++
            }
        }
    }
} else {
    Write-Output "[INFO] Copia del ZIP: clona el repo aparte para trabajar y hacer PR"
}

if ($pending -gt 0) {
    Write-Output 'Revisa los puntos anteriores con tu asistente. No se cambiaron configuraciones.'
    exit 1
}
Write-Output "Entorno comprobado para $Area."
