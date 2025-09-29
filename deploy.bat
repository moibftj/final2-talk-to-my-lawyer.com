@echo off
echo ========================================
echo Talk to My Lawyer - Netlify Deployment
echo ========================================
echo.

echo Step 1: Building the project...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    exit /b %errorlevel%
)
echo Build completed successfully!
echo.

echo Step 2: Deploying to Netlify...
echo Please follow the prompts:
echo - Choose: Create and configure a new project
echo - Enter site name: talk-to-my-lawyer-app (or your preferred name)
echo - Publish directory: dist
echo.
call npx netlify deploy --prod --dir=dist

echo.
echo ========================================
echo Deployment process started!
echo ========================================