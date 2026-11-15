@echo off
cd /d "%~dp0"

where git >nul 2>nul
if errorlevel 1 (
  echo Git is not installed. Install it from git-scm.com and run this file again.
  pause
  exit /b
)

echo.
echo Create an EMPTY repository on GitHub first (without README), then paste its URL.
set /p URL=Repository URL (https://github.com/.../....git): 
set /p NAME=Your name in latin letters (for example salima): 
set /p EMAIL=Your GitHub email: 

git init
git config user.name "%NAME%"
git config user.email "%EMAIL%"
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin %URL%
git push -u origin main

echo === Branch 1 ===
git checkout -b feature/%NAME%-1
echo - %NAME%: server part (server.js)>> README.md
git add .
git commit -m "Add part 1 to README"
git push -u origin feature/%NAME%-1

echo === Branch 2 ===
git checkout main
git checkout -b feature/%NAME%-2
echo - %NAME%: client part (public folder)>> README.md
git add .
git commit -m "Add part 2 to README"
git push -u origin feature/%NAME%-2

git checkout main
echo.
echo DONE. Now open your repository on GitHub and create two Pull Requests.
pause
