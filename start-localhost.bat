@echo off
setlocal
cd /d "%~dp0"

if /i "%~1"=="server" goto runserver

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo Node.js and npm are required to run CoolRoute.
  echo Install Node.js, then run this file again.
  pause
  exit /b 1
)

if not exist "node_modules\next\dist\bin\next" (
  echo Dependencies are missing. Installing them now...
  call npm install
  if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)

echo Starting CoolRoute at http://localhost:3000/
echo A server window will open. Keep it open while using the site.
start "CoolRoute server" cmd.exe /k ""%~f0" server"
powershell.exe -NoProfile -Command "$url='http://localhost:3000/'; $ready=$false; for($i=0; $i -lt 60; $i++){ try { $client=New-Object System.Net.Sockets.TcpClient; $attempt=$client.BeginConnect('127.0.0.1',3000,$null,$null); if($attempt.AsyncWaitHandle.WaitOne(1000,$false) -and $client.Connected){$ready=$true}; $client.Close() } catch {}; if($ready){Start-Process $url; exit 0}; Start-Sleep -Milliseconds 500 }; exit 1"
if errorlevel 1 (
  echo CoolRoute did not start on port 3000.
  echo Check the CoolRoute server window for the error message.
  pause
)
exit /b

:runserver
set "NEXT_DIST_DIR=.next-local-desktop"
call npm run dev -- --webpack --hostname 127.0.0.1 --port 3000
pause
