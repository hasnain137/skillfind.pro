
$sourceBase = "src\app\[locale]\pro\pro"
$destBase = "src\app\[locale]\pro"

# Kill git
try { taskkill /F /IM git.exe 2>$null } catch {}
if (Test-Path ".git\index.lock") { Remove-Item ".git\index.lock" -Force }

# Robocopy moves
# /MOVE: Moves files and dirs (deletes from source after copy).
# /E: Copy subdirectories, including empty ones.
# /IS: Include same files.
# /IT: Include tweaked files.

Write-Host "Moving jobs..."
robocopy "$sourceBase\jobs" "$destBase\jobs" /MOVE /E /IS /IT

Write-Host "Moving profile..."
robocopy "$sourceBase\profile" "$destBase\profile" /MOVE /E /IS /IT

Write-Host "Moving requests..."
robocopy "$sourceBase\requests" "$destBase\requests" /MOVE /E /IS /IT

Write-Host "Moving wallet..."
robocopy "$sourceBase\wallet" "$destBase\wallet" /MOVE /E /IS /IT

# Remove source base if empty
if (Test-Path $sourceBase) {
    Remove-Item $sourceBase -Force -Recurse -ErrorAction SilentlyContinue
}

# Git
git add .
git commit -m "Fix: Robocopy move of pro subdirectories to correct location"
git push origin main
