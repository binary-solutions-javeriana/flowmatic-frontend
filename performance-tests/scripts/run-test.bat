@echo off
setlocal enabledelayedexpansion

REM Flowmatic Frontend Performance Test Script
REM 50 users, 2 minutes, NO authentication

REM Configuration
set JMETER_HOME=%JMETER_HOME%
if "%JMETER_HOME%"=="" set JMETER_HOME=C:\Users\elpip\Downloads\apache-jmeter-5.6.3
set TEST_PLAN=performance-tests\jmeter\flowmatic-test.jmx
set RESULTS_DIR=performance-tests\results
set REPORT_DIR=performance-tests\reports

REM Generate timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set TIMESTAMP=%YYYY%%MM%%DD%_%HH%%Min%%Sec%

set RESULT_FILE=%RESULTS_DIR%\test_%TIMESTAMP%.jtl
set REPORT_FILE=%REPORT_DIR%\test_report_%TIMESTAMP%

echo ==========================================
echo Flowmatic Frontend Performance Test
echo ==========================================
echo.
echo Configuration:
echo - 50 concurrent users
echo - 2 minute duration  
echo - 10 second ramp-up
echo - NO authentication calls
echo - Only static pages and navigation
echo.

REM Check JMeter
if not exist "%JMETER_HOME%\bin\jmeter.bat" (
    echo [ERROR] JMeter not found at %JMETER_HOME%
    exit /b 1
)
echo [SUCCESS] JMeter found

REM Check test plan
if not exist "%TEST_PLAN%" (
    echo [ERROR] Test plan not found: %TEST_PLAN%
    exit /b 1
)
echo [SUCCESS] Test plan found

REM Create directories
if not exist "%RESULTS_DIR%" mkdir "%RESULTS_DIR%"
if not exist "%REPORT_DIR%" mkdir "%REPORT_DIR%"

REM Check if frontend is running
echo [INFO] Checking if frontend is running at http://localhost:4000...
curl -s --connect-timeout 5 http://localhost:4000 >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Frontend is running
) else (
    echo [ERROR] Frontend not responding at http://localhost:4000
    echo Please start the frontend with: npm run dev
    exit /b 1
)

echo.
echo [INFO] Starting performance test (2 minutes)...
echo Results: %RESULT_FILE%
echo Report: %REPORT_FILE%
echo.

REM Run JMeter
"%JMETER_HOME%\bin\jmeter.bat" ^
    -n ^
    -t "%TEST_PLAN%" ^
    -l "%RESULT_FILE%" ^
    -e ^
    -o "%REPORT_FILE%" ^
    -j "%RESULTS_DIR%\jmeter_%TIMESTAMP%.log"

if %errorlevel% equ 0 (
    echo [SUCCESS] Performance test completed successfully
) else (
    echo [ERROR] Test failed
    exit /b 1
)

echo.
echo ==========================================
echo PERFORMANCE TEST COMPLETED
echo ==========================================
echo.
echo Results: %RESULT_FILE%
echo HTML Report: %REPORT_FILE%\index.html
echo.

if exist "%RESULT_FILE%" (
    for /f %%i in ('find /c /v "" "%RESULT_FILE%"') do set total_lines=%%i
    for /f %%i in ('find /c "false" "%RESULT_FILE%"') do set error_count=%%i
    
    echo Total Samples: %total_lines%
    echo Errors: %error_count%
    if %total_lines% gtr 0 (
        set /a success_rate=100-%error_count%*100/%total_lines%
        echo Success Rate: %success_rate%%%
    )
)

echo.
echo [SUCCESS] Performance test completed!
echo Open the HTML report: %REPORT_FILE%\index.html
echo.
echo NOTE: This test did NOT make any authentication calls
echo to avoid Supabase email verification issues.

pause
