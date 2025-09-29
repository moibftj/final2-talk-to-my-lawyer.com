@echo off
echo ========================================
echo Push to New Repository
echo ========================================
echo.
echo IMPORTANT: Replace YOUR-USERNAME with your actual GitHub username
echo Example: https://github.com/moizjamil/final-talk-to-my-lawyer.com.git
echo.
set /p REPO_URL="Enter your new repository URL: "

echo.
echo Adding new remote...
git remote add new-origin %REPO_URL%

echo.
echo Pushing all commits to new repository...
git push -u new-origin main

echo.
echo ========================================
echo Done! Your code is now in the new repository
echo ========================================
pause