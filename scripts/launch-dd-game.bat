@echo off
setlocal enabledelayedexpansion
title DD Game Scratch Launcher

:: ============================================================
:: DD GAME SCRATCH - Windows Desktop Launcher
:: Developed by its2much Mv
:: ============================================================

:: 1. Determine absolute project directory from script location
set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "PROJECT_DIR=%%~fI"

cd /d "%PROJECT_DIR%"
if errorlevel 1 (
    echo [!] ERROR: Failed to navigate to project directory: %PROJECT_DIR%
    pause
    exit /b 1
)

:: 2. Ensure logs directory exists
if not exist "logs\" mkdir "logs"
set "LOG_FILE=%PROJECT_DIR%\logs\launcher.log"
set "VITE_LOG=%PROJECT_DIR%\logs\vite-server.log"

echo ============================================================ >> "%LOG_FILE%"
echo [%DATE% %TIME%] Starting DD Game Scratch Launcher >> "%LOG_FILE%"
echo Project Location: %PROJECT_DIR% >> "%LOG_FILE%"

echo ============================================================
echo   DD GAME SCRATCH ^| Darling Dennis Game
echo   Developed by its2much Mv
echo ============================================================
echo.
echo [*] Project Location: %PROJECT_DIR%
echo [*] Launcher Log:     %LOG_FILE%

:: 3. Verify Node.js availability
where node >nul 2>&1
if errorlevel 1 (
    echo [!] ERROR: Node.js was not detected in PATH.
    echo [%DATE% %TIME%] ERROR: Node.js missing >> "%LOG_FILE%"
    echo Please install Node.js from https://nodejs.org/
    echo Once installed, restart your launcher.
    pause
    exit /b 1
)

:: 4. Verify npm availability
where npm >nul 2>&1
if errorlevel 1 (
    echo [!] ERROR: npm was not detected in PATH.
    echo [%DATE% %TIME%] ERROR: npm missing >> "%LOG_FILE%"
    echo Please ensure npm is installed and added to PATH.
    pause
    exit /b 1
)

:: 5. Verify dependencies exist
if not exist "node_modules\" (
    echo [*] Project dependencies missing. Installing dependencies...
    echo [%DATE% %TIME%] Installing npm dependencies >> "%LOG_FILE%"
    call npm install >> "%LOG_FILE%" 2>&1
    if errorlevel 1 (
        echo [!] ERROR: npm install failed. Please check your network or npm configuration.
        echo [%DATE% %TIME%] ERROR: npm install failed >> "%LOG_FILE%"
        pause
        exit /b 1
    )
)

:: 6. Check if DD Game server is ALREADY running and responding on port 5173
set "SERVER_READY=0"

where curl >nul 2>&1
if not errorlevel 1 (
    curl -s -m 2 http://localhost:5173/ 2>nul | findstr /i "Darling" >nul 2>&1
    if not errorlevel 1 (
        set "SERVER_READY=1"
        echo [*] DD Game server is already active and verified on http://localhost:5173/
        echo [%DATE% %TIME%] Existing DD Game server verified on http://localhost:5173/ >> "%LOG_FILE%"
        goto :DETECT_CHROME
    )
)

:: Check if port 5173 is occupied by an unrelated application
set "PORT_CONFLICT=0"
set "CONFLICT_PID=0"
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":5173 " ^| findstr "LISTENING"') do (
    set "CONFLICT_PID=%%P"
    set "PORT_CONFLICT=1"
)

if "%PORT_CONFLICT%"=="1" (
    echo [!] ERROR: Port 5173 is occupied by another application PID %CONFLICT_PID%.
    echo [%DATE% %TIME%] ERROR: Port 5173 conflict with PID %CONFLICT_PID% >> "%LOG_FILE%"
    echo Please close the conflicting application or service, then try again.
    pause
    exit /b 1
)

:: 7. Start the Vite development server in a persistent background process
echo [*] Starting Vite game server on http://localhost:5173/ ...
echo [%DATE% %TIME%] Starting Vite server in background process >> "%LOG_FILE%"

start "DD Game Server" /min cmd /c "cd /d "%PROJECT_DIR%" && npm run dev > "%VITE_LOG%" 2>&1"

:: 8. Poll server until genuinely ready - up to 30 attempts
echo [*] Waiting for game server to become ready...
set "WAIT_COUNT=0"

:WAIT_LOOP
ping 127.0.0.1 -n 2 >nul
set /a WAIT_COUNT+=1

where curl >nul 2>&1
if not errorlevel 1 (
    curl -s -m 2 http://localhost:5173/ 2>nul | findstr /i "Darling" >nul 2>&1
    if not errorlevel 1 (
        set "SERVER_READY=1"
        goto :DETECT_CHROME
    )
) else (
    for /f "tokens=*" %%A in ('netstat -ano ^| findstr ":5173 " ^| findstr "LISTENING"') do (
        set "SERVER_READY=1"
        goto :DETECT_CHROME
    )
)

if %WAIT_COUNT% geq 30 (
    echo [!] ERROR: Server startup timed out after 30 seconds.
    echo [%DATE% %TIME%] ERROR: Server readiness check timed out >> "%LOG_FILE%"
    echo Check the server log for details: %VITE_LOG%
    pause
    exit /b 1
)

goto :WAIT_LOOP

:DETECT_CHROME
echo [*] Server is live and verified!
echo [%DATE% %TIME%] Server verified ready. Detecting Google Chrome... >> "%LOG_FILE%"

:: 9. Detect Google Chrome executable safely
set "CHROME_BIN="

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_BIN=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
    goto :CHROME_FOUND
)

set "PF_X86=%ProgramFiles(x86)%"
if defined PF_X86 (
    if exist "%PF_X86%\Google\Chrome\Application\chrome.exe" (
        set "CHROME_BIN=%PF_X86%\Google\Chrome\Application\chrome.exe"
        goto :CHROME_FOUND
    )
)

if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_BIN=%LocalAppData%\Google\Chrome\Application\chrome.exe"
    goto :CHROME_FOUND
)

for /f "tokens=2*" %%A in ('reg query "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" /ve 2^>nul ^| findstr "REG_SZ"') do (
    if exist "%%B" (
        set "CHROME_BIN=%%B"
        goto :CHROME_FOUND
    )
)

for /f "tokens=2*" %%A in ('reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" /ve 2^>nul ^| findstr "REG_SZ"') do (
    if exist "%%B" (
        set "CHROME_BIN=%%B"
        goto :CHROME_FOUND
    )
)

:CHROME_FOUND
:: 10. Launch browser
if defined CHROME_BIN (
    echo [*] Opening DD Game Scratch in Google Chrome:
    echo     "!CHROME_BIN!"
    echo [%DATE% %TIME%] Launching Google Chrome: !CHROME_BIN! >> "%LOG_FILE%"
    start "" "!CHROME_BIN!" "http://localhost:5173/"
) else (
    echo [!] Google Chrome not found in standard paths. Falling back to default browser...
    echo [%DATE% %TIME%] Chrome not found. Launching default browser >> "%LOG_FILE%"
    start "" "http://localhost:5173/"
)

echo.
echo ============================================================
echo   DD GAME SCRATCH IS RUNNING!
echo   URL: http://localhost:5173/
echo   Server is running in the background. Enjoy the game!
echo ============================================================
echo [%DATE% %TIME%] Game launch completed successfully >> "%LOG_FILE%"
echo.

:: 2 second confirmation display then finish
ping 127.0.0.1 -n 3 >nul
exit /b 0
