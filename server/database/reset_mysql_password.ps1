# Run this script as Administrator (right-click > Run with PowerShell)
# It will reset MySQL root password to 123456

Write-Host "=== MySQL Password Reset Script ===" -ForegroundColor Cyan
Write-Host ""

# Stop MySQL
Write-Host "Stopping MySQL service..." -ForegroundColor Yellow
Stop-Service MySQL80 -Force -ErrorAction SilentlyContinue
Start-Sleep 3

# Start MySQL in skip-grant-tables mode
Write-Host "Starting MySQL in safe mode..." -ForegroundColor Yellow
$proc = Start-Process -FilePath "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" -ArgumentList '--defaults-file="C:\ProgramData\MySQL\MySQL Server 8.0\my.ini"','--skip-grant-tables','--skip-networking' -PassThru
Start-Sleep 5

# Reset password
Write-Host "Resetting root password to 123456..." -ForegroundColor Yellow
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -e "FLUSH PRIVILEGES; ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '123456'; FLUSH PRIVILEGES; exit;"
if ($LASTEXITCODE -eq 0) {
    Write-Host "Password reset successful!" -ForegroundColor Green
} else {
    Write-Host "Trying alternative method..." -ForegroundColor Yellow
    & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -e "FLUSH PRIVILEGES; UPDATE mysql.user SET authentication_string=PASSWORD('123456') WHERE User='root' AND Host='localhost'; FLUSH PRIVILEGES; exit;"
}

# Stop safe-mode MySQL
Write-Host "Stopping safe-mode MySQL..." -ForegroundColor Yellow
Stop-Process -Name mysqld -Force -ErrorAction SilentlyContinue
Start-Sleep 3

# Start MySQL normally
Write-Host "Starting MySQL normally..." -ForegroundColor Yellow
Start-Service MySQL80
Start-Sleep 3

# Verify
Write-Host "Verifying connection..." -ForegroundColor Yellow
$result = & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p123456 -e "SELECT 'SUCCESS!' as status" 2>&1
Write-Host $result

Write-Host ""
Write-Host "=== Done! Password is now: 123456 ===" -ForegroundColor Green
