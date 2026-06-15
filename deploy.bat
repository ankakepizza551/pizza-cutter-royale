@echo off
chcp 65001 > nul
cd /d "J:\制作データ\tools\pizza_cutting"

echo.
echo ===== Pizza Cutter Royale - Deploy =====
echo.

git status

echo.
set /p MSG="コミットメッセージを入力 (空Enterで自動日時): "

if "%MSG%"=="" (
    for /f "tokens=*" %%i in ('powershell -command "Get-Date -Format \"yyyy-MM-dd HH:mm\""') do set MSG=update %%i
)

echo.
git add .
git commit -m "%MSG%"
git push

echo.
echo ✅ 完了！
echo https://ankakepizza551.github.io/pizza-cutter-royale/
echo.
pause
