@echo off
setlocal enabledelayedexpansion
title DD Game Scratch Launcher

:: Determine absolute project directory
set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "PROJECT_DIR=%%~fI"

echo ============================================================
echo   DD GAME SCRATCH ^| Darling Dennis Game
echo   Developed by its2much Mv
echo ============================================================
echo.
echo [*] Project Location: %PROJECT_DIR%

cd /d "%PROJECT_DIR%"
if errorlevel 1 (
    echo [!] ERROR: Could not navigate to project directory: %PROJECT_DIR%
    pause
    exit /b 1
)

:: 1. Verify Node.js availability
where node >nul 2>&1
if errorlevel 1 (
    echo [!] ERROR: Node.js was not detected on this system.
    echo Please install Node.js (v20.19+ recommended) from https://nodejs.org/
    echo Once installed, restart your command prompt or launcher.
    pause
    exit /b 1
)

:: 2. Verify npm availability
where npm >nul 2>&1
if errorlevel 1 (
    echo [!] ERROR: npm was not detected on this system.
    echo Please ensure npm is installed and added to your PATH environment variable.
    pause
    exit /b 1
)

:: 3. Verify node_modules installation
if not exist "node_modules\" (
    echo [*] Project dependencies missing. Running npm install...
    call npm install
    if errorlevel 1 (
        echo [!] ERROR: npm install failed. Please check your internet connection or npm configuration.
        pause
        exit /b 1
    )
)

:: 4. Check if Vite dev server is already running on port 5173
set "PORT_IN_USE=0"
for /f "tokens=*" %%A in ('netstat -ano ^| findstr ":5173 " ^| findstr "LISTENING"') do (
    set "PORT_IN_USE=1"
)

if "%PORT_IN_USE%"=="1" (
    echo [*] DD Game server is already active on http://localhost:5173/
    echo [*] Launching default browser...
    start "" "http://localhost:5173/"
    echo.
    echo ============================================================
    echo   Game is active in your browser!
    echo   Keep this launcher open while playing.
    echo ============================================================
    pause
    exit /b 0
)

echo [*] Starting Vite game server on http://localhost:5173/ ...

:: Launch npm run dev as background process tied to this session
start "DD Game Server" /min cmd /c "cd /d "%PROJECT_DIR%" && npm run dev"

:: Wait for server to become responsive
echo [*] Waiting for server to initialize...
set "WAIT_ATTEMPTS=0"
:WAIT_LOOP
timeout /t 1 /nobreak >nul
set /a WAIT_ATTEMPTS+=1

for /f "tokens=*" %%A in ('netstat -ano ^| findstr ":5173 " ^| findstr "LISTENING"') do (
    goto SERVER_READY
)

if %WAIT_ATTEMPTS% geq 25 (
    echo [!] Server startup took longer than expected. Attempting browser launch...
    goto SERVER_READY
)
goto WAIT_LOOP

:SERVER_READY
echo [*] Server is live! Opening DD Game Scratch in default browser...
start "" "http://localhost:5173/"

echo.
echo ============================================================
echo   DD GAME SCRATCH IS RUNNING!
echo   URL: http://localhost:5173/
echo   Close this window when you are finished playing.
echo ============================================================
echo.

:: Keep window alive while game is running
pause
