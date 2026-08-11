@echo off
cd /d "%~dp0.."
if not exist node_modules (
  echo Installation des dependances...
  call npm install
)
if not exist .env (
  copy .env.example .env >nul
)
echo.
echo Demarrage de Les Aventuriers du Lys...
echo Ouvre ton navigateur sur http://localhost:3000
echo.
npm start
pause
