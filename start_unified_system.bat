@echo off
title LIL Bawal - Unified Manufacturing Dashboard Suite
echo ======================================================================
echo           LIL BAWAL - UNIFIED INDUSTRIAL SUITE (MOULD 3.0)
echo   Consolidated Plant Head, Machine Performance, and Mould Maintenance
echo ======================================================================
echo.
echo [1/2] Starting Unified Backend on Port 3010...
cd /d "%~dp0Unified_Backend"
start "Unified Backend (Port 3010)" cmd /k "node index.js"

echo [2/2] Starting Unified Frontend on Port 3000...
cd /d "%~dp0Unified_Frontend"
start "Unified Frontend (Port 3000)" cmd /k "npx vite --port 3000 --host 0.0.0.0"

echo.
echo Waiting for services to initialize...
ping -n 4 127.0.0.1 >nul

echo Opening browser at http://localhost:3000 ...
start http://localhost:3000

echo.
echo ======================================================================
echo System successfully started!
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:3010
echo API Docs: http://localhost:3010/api/status
echo ======================================================================
