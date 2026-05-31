@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
node --no-warnings "%SCRIPT_DIR%harness_cli.mjs" %*
exit /b %ERRORLEVEL%
