@echo off
cd /d "%~dp0"
echo === Installing packages ===
call npm install
start "CHAT SERVER" cmd /k "cd /d %~dp0 && npm start"
timeout /t 4 >nul
start http://localhost:3000
start http://localhost:3000
echo.
echo Done. Server window opened. Close it to stop.
pause
