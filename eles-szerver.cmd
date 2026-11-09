@echo off
rem Eles build (Node adapter) helyi teszteleshez a 8151-es porton
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"
set "DEPLOY_TARGET=node"
call npx astro build || exit /b 1
set "HOST=127.0.0.1"
set "PORT=8151"
node --env-file-if-exists=.env dist/server/entry.mjs
