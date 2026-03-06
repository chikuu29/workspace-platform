@echo off

echo Starting Development Environment...

start cmd /k "cd OAUTH/backend && uv run uvicorn app.main:app --reload"
start cmd /k "cd OAUTH/frontend && npm run dev"
start cmd /k "cd workspace/workspace-platform-backend && npm run dev"
start cmd /k "cd workspace/workspace-platform && npm run dev"

echo.
echo Press any key to stop all services...
pause >nul

taskkill /IM node.exe /F >nul 2>&1
taskkill /IM uvicorn.exe /F >nul 2>&1
taskkill /IM python.exe /F >nul 2>&1

echo All services stopped.
