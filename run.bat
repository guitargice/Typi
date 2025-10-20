@echo off
echo Starting Typi - Typing Tutor Game...
echo.

REM Check if Python 3 is available
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Starting local server with Python...
    echo Server running at http://localhost:8000
    echo Press Ctrl+C to stop the server
    echo.
    timeout /t 2 /nobreak >nul
    start http://localhost:8000
    python -m http.server 8000
    goto :end
)

REM Check if Python 2 is available (as py command)
py --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Starting local server with Python...
    echo Server running at http://localhost:8000
    echo Press Ctrl+C to stop the server
    echo.
    timeout /t 2 /nobreak >nul
    start http://localhost:8000
    py -m http.server 8000
    goto :end
)

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Starting local server with Node.js...
    echo Server running at http://localhost:8000
    echo Press Ctrl+C to stop the server
    echo.
    
    REM Check if http-server is installed globally
    where http-server >nul 2>&1
    if %errorlevel% equ 0 (
        timeout /t 2 /nobreak >nul
        start http://localhost:8000
        http-server -p 8000
        goto :end
    ) else (
        echo Installing http-server...
        call npm install -g http-server
        timeout /t 2 /nobreak >nul
        start http://localhost:8000
        http-server -p 8000
        goto :end
    )
)

REM If no server is available
echo ERROR: No suitable server found!
echo.
echo Please install one of the following:
echo   - Python 3: https://www.python.org/downloads/
echo   - Node.js: https://nodejs.org/
echo.
pause
goto :end

:end

