@echo off
title Co-Founder Transparency Portal
echo ========================================================
echo  Launching Co-Founder Transparency & Management Portal...
echo ========================================================
echo.
if exist "%~dp0server.js" (
  node "%~dp0server.js"
) else (
  start "" "%~dp0index.html"
)
