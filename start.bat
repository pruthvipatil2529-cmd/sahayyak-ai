@echo off
title Sahayyak AI Launcher
color 0B
echo ========================================================
echo             Starting Sahayyak AI Platform
echo   (AI-Powered Assistant for Elderly & Beginners)
echo ========================================================
echo.

cd /d "%~dp0"

:: 1. Backend Environment Verification
echo [1/4] Checking Python Backend environment...
if not exist "backend\venv\Scripts\python.exe" (
    echo [INFO] Virtual environment not found. Creating backend venv...
    python -m venv backend\venv
    echo [INFO] Installing Python dependencies...
    backend\venv\Scripts\pip.exe install -r backend\requirements.txt
) else (
    echo [OK] Python virtual environment ready.
)

:: 2. Frontend Dependencies Verification
echo.
echo [2/4] Checking Frontend dependencies...
if not exist "frontend\node_modules" (
    echo [INFO] Node modules not found. Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
) else (
    echo [OK] Frontend packages ready.
)

:: 3. Launch Backend in Separate Window
echo.
echo [3/4] Launching FastAPI Backend on http://localhost:8000...
start "Sahayyak AI - Backend Server" cmd /k "cd /d %~dp0backend && venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

:: 4. Launch Frontend in Separate Window
echo Launching React/Vite Frontend on http://localhost:5173...
start "Sahayyak AI - Frontend Web App" cmd /k "cd /d %~dp0frontend && npm run dev"

:: Wait briefly for services to spin up
echo.
echo [4/4] Waiting for services to initialize...
timeout /t 4 /nobreak >nul

:: Open default web browser
echo Launching Sahayyak AI in your web browser...
start http://localhost:5173

echo.
echo ========================================================
echo             Sahayyak AI is now running!
echo ========================================================
echo   Web Application : http://localhost:5173
echo   API Health      : http://localhost:8000/api/health
echo   Interactive Docs: http://localhost:8000/docs
echo ========================================================
echo Note: Please keep the two opened server windows running.
echo To stop everything later, simply run 'stop.bat'.
echo.
pause
