@echo off
echo ===========================================
echo   Finance App - Build & Publish to GitHub
echo ===========================================
echo.

set /p GH_TOKEN="Enter your GitHub Token (or press Enter if set in system): "
if "%GH_TOKEN%"=="" goto check_env

:set_token
set GH_TOKEN=%GH_TOKEN%
goto run_build

:check_env
if "%GH_TOKEN%"=="" (
    echo.
    echo [INFO] No token entered, checking environment...
    if "%GH_TOKEN%"=="" (
        echo [WARNING] No GH_TOKEN found! simple command will likely fail.
        echo Please edit this file to set GH_TOKEN=your_token_here if needed.
    )
)

:run_build
echo.
echo Starting release process...
call npm run dist
echo.

if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Build and Publish completed!
) else (
    echo [ERROR] Build failed. check output above.
)

echo.
pause
