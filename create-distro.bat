@echo off
REM talk-to-my-lawyer Distribution Creator for Windows
REM This script creates a production-ready distribution of the application

setlocal enabledelayedexpansion

echo ========================================
echo   talk-to-my-lawyer Distribution Creator
echo ========================================
echo.

REM Configuration
set "DISTRO_NAME=talk-to-my-lawyer-distro"
for /f "tokens=*" %%i in ('node -p "require('./package.json').version"') do set "VERSION=%%i"
for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set "DATE=%%c%%a%%b"
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set "TIME=%%a%%b"
set "TIMESTAMP=%DATE%_%TIME%"
set "DISTRO_DIR=dist\%DISTRO_NAME%_v%VERSION%_%TIMESTAMP%"

echo 🧹 Cleaning previous builds...
if exist dist rmdir /s /q dist
mkdir "%DISTRO_DIR%"

echo 🔨 Building production application...
call npm run build

echo 📦 Creating distribution package...

REM Copy essential files
xcopy /s /e /i dist "%DISTRO_DIR%\" 2>nul || echo No dist folder found, will include source
copy Dockerfile "%DISTRO_DIR%\" >nul 2>&1
copy docker-compose.yml "%DISTRO_DIR%\" >nul 2>&1
copy package.json "%DISTRO_DIR%\" >nul 2>&1
copy package-lock.json "%DISTRO_DIR%\" >nul 2>&1 || echo No package-lock.json found
copy nginx.conf "%DISTRO_DIR%\" >nul 2>&1 || echo No nginx.conf found

REM Copy documentation
copy README.md "%DISTRO_DIR%\" >nul 2>&1 || echo No README.md found
copy docker-setup.md "%DISTRO_DIR%\" >nul 2>&1 || echo No docker-setup.md found

REM Create deployment script for Windows
(
echo @echo off
echo REM Deployment script for talk-to-my-lawyer
echo.
echo echo 🚀 Deploying talk-to-my-lawyer...
echo.
echo REM Check if Docker is running
echo docker info >nul 2>&1
echo if errorlevel 1 ^(
echo     echo ❌ Docker is not running. Please start Docker first.
echo     pause
echo     exit /b 1
echo ^)
echo.
echo REM Create environment file if it doesn't exist
echo if not exist .env ^(
echo     echo 📝 Creating .env file...
echo     ^(
echo     echo # Supabase Configuration
echo     echo VITE_SUPABASE_URL=http://localhost:54323
echo     echo VITE_SUPABASE_ANON_KEY=your-anon-key-here
echo     echo SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
echo     echo.
echo     echo # Database
echo     echo POSTGRES_PASSWORD=your-super-secret-and-long-postgres-password
echo     echo.
echo     echo # JWT
echo     echo JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long
echo     echo.
echo     echo # Google AI ^(if using^)
echo     echo GOOGLE_AI_API_KEY=your-google-ai-api-key
echo     ^) ^> .env
echo     echo ⚠️  Please edit .env file with your actual configuration before running again.
echo     pause
echo     exit /b 1
echo ^)
echo.
echo echo 📥 Pulling latest Docker images...
echo docker-compose pull
echo.
echo echo 🔨 Building and starting services...
echo docker-compose up -d --build
echo.
echo echo ⏳ Waiting for services to start...
echo timeout /t 10 /nobreak >nul
echo.
echo echo 🔍 Running health checks...
echo docker-compose ps ^| findstr "Up" >nul
echo if not errorlevel 1 ^(
echo     echo ✅ Services are running!
echo     echo.
echo     echo 🌐 Access your application:
echo     echo    Frontend: http://localhost:3000
echo     echo    Supabase Studio: http://localhost:54321
echo     echo.
echo     echo 📊 View logs with: docker-compose logs -f
echo     echo 🛑 Stop with: docker-compose down
echo ^) else ^(
echo     echo ❌ Some services failed to start. Check logs with: docker-compose logs
echo     pause
echo     exit /b 1
echo ^)
echo.
echo pause
) > "%DISTRO_DIR%\deploy.bat"

REM Create stop script
(
echo @echo off
echo echo 🛑 Stopping talk-to-my-lawyer services...
echo docker-compose down
echo echo ✅ Services stopped successfully!
echo pause
) > "%DISTRO_DIR%\stop.bat"

REM Create update script
(
echo @echo off
echo echo 🔄 Updating talk-to-my-lawyer...
echo docker-compose pull
echo docker-compose up -d --build
echo echo ✅ Update completed!
echo pause
) > "%DISTRO_DIR%\update.bat"

REM Create installation guide
(
echo # talk-to-my-lawyer Installation Guide
echo.
echo ## Prerequisites
echo.
echo 1. **Docker Desktop for Windows**: Install from https://docker.com
echo 2. **At least 4GB RAM** available for containers
echo 3. **Ports 3000, 54321-54325** should be available
echo.
echo ## Quick Installation
echo.
echo 1. **Extract this package** to your desired location
echo 2. **Run the deployment script**:
echo    ```
echo    deploy.bat
echo    ```
echo 3. **Follow the prompts** to configure your environment
echo 4. **Access your application** at http://localhost:3000
echo.
echo ## Manual Installation
echo.
echo If the automatic script doesn't work:
echo.
echo 1. **Create environment file**:
echo    Copy the environment template from deploy.bat and save as .env
echo.
echo 2. **Edit .env** with your configuration
echo.
echo 3. **Start services**:
echo    ```
echo    docker-compose up -d
echo    ```
echo.
echo ## Management Commands
echo.
echo - **Start**: `deploy.bat` or `docker-compose up -d`
echo - **Stop**: `stop.bat` or `docker-compose down`
echo - **Update**: `update.bat`
echo - **View logs**: `docker-compose logs -f`
echo - **Restart**: `docker-compose restart`
echo.
echo ## Windows-Specific Notes
echo.
echo ### WSL2 Backend
echo Make sure Docker Desktop is using WSL2 backend for better performance.
echo.
echo ### File Permissions
echo Windows doesn't require chmod, but make sure Docker Desktop has access to the folder.
echo.
echo ### Firewall
echo Windows Firewall may prompt for Docker access - allow it.
echo.
echo ## Troubleshooting
echo.
echo ### Port Conflicts
echo If ports are in use, edit `docker-compose.yml` and change:
echo - `3000:80` to `YOUR_PORT:80` for frontend
echo - `54321:8000` to `YOUR_PORT:8000` for Supabase Studio
echo.
echo ### Docker Issues
echo Reset Docker state:
echo ```
echo docker-compose down
echo docker system prune -f
echo deploy.bat
echo ```
echo.
echo ### PowerShell Execution Policy
echo If scripts won't run, open PowerShell as Administrator and run:
echo ```
echo Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
echo ```
) > "%DISTRO_DIR%\INSTALL.md"

REM Create version info
(
echo talk-to-my-lawyer Distribution Package
echo.
echo Version: %VERSION%
echo Build Date: %date% %time%
echo Build ID: %TIMESTAMP%
echo Platform: Windows
echo Docker Images:
echo - Frontend: talk-to-my-lawyer-frontend:%VERSION%
echo - Base: node:18-alpine, nginx:alpine
echo.
echo Included Services:
echo - Frontend Application ^(React + Vite^)
echo - Supabase ^(Database + Auth + API^)
echo - Redis ^(Caching^)
echo - Nginx ^(Reverse Proxy^)
echo.
echo System Requirements:
echo - Docker Desktop 20.10+
echo - Windows 10/11
echo - WSL2 ^(recommended^)
echo - 4GB+ RAM
echo - 2GB+ Disk Space
) > "%DISTRO_DIR%\VERSION.txt"

echo.
echo ✅ Distribution created successfully!
echo.
echo 📦 Package Information:
echo    Name: %DISTRO_NAME%
echo    Version: %VERSION%
echo    Build ID: %TIMESTAMP%
echo.
echo 📁 Files created:
echo    Directory: %DISTRO_DIR%\
echo.
echo 🚀 To deploy:
echo    1. Navigate to %DISTRO_DIR%\
echo    2. Run: deploy.bat
echo    3. Configure .env file when prompted
echo    4. Access at http://localhost:3000
echo.
echo 🎉 Ready for distribution!
echo.
pause