@echo off
REM PAI Observability Dashboard Manager - Windows Batch Version
REM Usage: manage.cmd <start|stop|restart|status>

setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "SERVER_DIR=%SCRIPT_DIR%apps\server"
set "CLIENT_DIR=%SCRIPT_DIR%apps\client"
set "SERVER_PORT=4000"
set "CLIENT_PORT=5172"

if "%1"=="" (
    echo Usage: manage.cmd ^<start^|stop^|restart^|status^>
    exit /b 1
)

if "%1"=="start" goto :start
if "%1"=="stop" goto :stop
if "%1"=="restart" goto :restart
if "%1"=="status" goto :status
if "%1"=="start-detached" goto :start_detached

echo Unknown command: %1
echo Usage: manage.cmd ^<start^|stop^|restart^|status^|start-detached^>
exit /b 1

:start
echo Starting observability server...
cd /d "%SERVER_DIR%"
start "PAI-Observability-Server" /min cmd /c "bun run dev"

echo Waiting for server to start...
timeout /t 5 /nobreak >nul

echo Starting observability client...
cd /d "%CLIENT_DIR%"
start "PAI-Observability-Client" /min cmd /c "bun run dev"

echo Waiting for client to start...
timeout /t 5 /nobreak >nul

echo.
echo Observability running at http://localhost:%CLIENT_PORT%
goto :eof

:stop
echo Stopping observability...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%SERVER_PORT% " ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%CLIENT_PORT% " ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
REM Kill any titled windows
taskkill /FI "WINDOWTITLE eq PAI-Observability-Server*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq PAI-Observability-Client*" /F >nul 2>&1
echo Observability stopped
goto :eof

:restart
echo Restarting...
call :stop
timeout /t 2 /nobreak >nul
call :start
goto :eof

:status
netstat -aon | findstr ":%SERVER_PORT% " | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
    set "SERVER_STATUS=running"
) else (
    set "SERVER_STATUS=stopped"
)

netstat -aon | findstr ":%CLIENT_PORT% " | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
    set "CLIENT_STATUS=running"
) else (
    set "CLIENT_STATUS=stopped"
)

if "!SERVER_STATUS!"=="running" if "!CLIENT_STATUS!"=="running" (
    echo Running at http://localhost:%CLIENT_PORT%
    echo   Server: port %SERVER_PORT% ^(running^)
    echo   Client: port %CLIENT_PORT% ^(running^)
) else if "!SERVER_STATUS!"=="running" (
    echo Partially running ^(server only^)
    echo   Server: port %SERVER_PORT% ^(running^)
    echo   Client: port %CLIENT_PORT% ^(stopped^)
) else if "!CLIENT_STATUS!"=="running" (
    echo Partially running ^(client only^)
    echo   Server: port %SERVER_PORT% ^(stopped^)
    echo   Client: port %CLIENT_PORT% ^(running^)
) else (
    echo Not running
)
goto :eof

:start_detached
call :start
goto :eof
