@echo off
echo ========================================
echo Niagara ADU Arbitrage Engine
echo Quick Start Script
echo ========================================
echo.

echo [1/7] Checking Python installation...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python not found. Please install Python 3.8+ first.
    pause
    exit /b 1
)
echo.

echo [2/7] Creating virtual environment...
if not exist venv (
    python -m venv venv
    echo Virtual environment created!
) else (
    echo Virtual environment already exists.
)
echo.

echo [3/7] Activating virtual environment...
call venv\Scripts\activate.bat
echo.

echo [4/7] Installing dependencies...
pip install -r requirements.txt
echo.

echo [5/7] Setting up environment...
if not exist .env (
    copy .env.example .env
    echo .env file created. Review and update if needed.
) else (
    echo .env file already exists.
)
echo.

echo [6/7] Initializing database...
set FLASK_APP=run.py
if not exist properties.db (
    flask db init
    flask db migrate -m "Initial migration"
    flask db upgrade
    echo Database initialized!
) else (
    echo Database already exists.
)
echo.

echo [7/7] Seeding sample data...
if not exist properties.db (
    python seed_data.py
) else (
    echo Run 'python seed_data.py' manually if you want to reseed.
)
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the application:
echo   1. Make sure virtual environment is active
echo   2. Run: python run.py
echo   3. Open: http://localhost:5000
echo.
echo Press any key to start the application now...
pause > nul

python run.py

