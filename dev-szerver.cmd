@echo off
rem Fejlesztoi szerver a 8150-es porton (Claude Preview inditja)
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"
npm run dev
