@echo off
cd /d "%~dp0"
echo Starting Admin Dashboard...
start http://localhost:5174/dashboard
cmd /c "npm run dev -- --port 5174"
pause
