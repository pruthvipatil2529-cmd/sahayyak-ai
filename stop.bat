@echo off
title Sahayyak AI Stopper
color 0C
echo ========================================================
echo             Stopping Sahayyak AI Services
echo ========================================================
echo.

echo Stopping processes listening on port 8000 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Stopping processes listening on port 5173 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [OK] All Sahayyak AI services have been stopped.
echo.
timeout /t 2 /nobreak >nul
