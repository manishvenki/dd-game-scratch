# DD Game Scratch - Desktop Shortcut Creation Script
# Developed by its2much Mv

$ErrorActionPreference = 'Stop'

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   DD GAME SCRATCH - Windows Desktop Shortcut Installer" -ForegroundColor Yellow
Write-Host "   Developed by its2much Mv" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = (Resolve-Path (Join-Path $scriptDir "..")).Path
$launcherBat = Join-Path $scriptDir "launch-dd-game.bat"
$iconFile = Join-Path $scriptDir "dd-game-icon.ico"

if (-not (Test-Path $launcherBat)) {
    Write-Error "Launcher script not found at: $launcherBat"
    exit 1
}

if (-not (Test-Path $iconFile)) {
    $iconFile = Join-Path $projectDir "public\assets\branding\dd-game-icon.ico"
}

$desktopPaths = @()
$envDesktop = [Environment]::GetFolderPath('Desktop')
if ($envDesktop -and (Test-Path $envDesktop)) {
    $desktopPaths += $envDesktop
}

$localDesktop = Join-Path $env:USERPROFILE "Desktop"
if ((Test-Path $localDesktop) -and ($desktopPaths -notcontains $localDesktop)) {
    $desktopPaths += $localDesktop
}

if ($desktopPaths.Count -eq 0) {
    Write-Error "Could not resolve a valid Windows Desktop folder for current user: $env:USERNAME"
    exit 1
}

$wshShell = New-Object -ComObject WScript.Shell
$createdList = @()

foreach ($desktop in $desktopPaths) {
    $shortcutPath = Join-Path $desktop "DD Game Scratch.lnk"
    try {
        $shortcut = $wshShell.CreateShortcut($shortcutPath)
        $shortcut.TargetPath = $launcherBat
        $shortcut.WorkingDirectory = $projectDir
        $shortcut.WindowStyle = 1
        $shortcut.Description = "DD Game Scratch (Darling Dennis Game) - Developed by its2much Mv"
        if (Test-Path $iconFile) {
            $shortcut.IconLocation = "$iconFile,0"
        }
        $shortcut.Save()
        $createdList += $shortcutPath
        Write-Host "[+] Successfully created Desktop shortcut at:" -ForegroundColor Green
        Write-Host "    $shortcutPath" -ForegroundColor White
    } catch {
        Write-Warning "Failed to create shortcut at $shortcutPath : $_"
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  INSTALLATION COMPLETE!" -ForegroundColor Green
Write-Host "  Shortcut Name: DD Game Scratch.lnk" -ForegroundColor White
Write-Host "  Target: $launcherBat" -ForegroundColor White
Write-Host "  Icon: $iconFile" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
