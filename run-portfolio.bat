@echo off
cd /d "%~dp0"
echo Starting portfolio server...
start http://localhost:5174/
cmd /c "npm run dev -- --port 5174"
pause
