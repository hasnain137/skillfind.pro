
try {
    taskkill /F /IM git.exe 2>$null
} catch {}

if (Test-Path "C:/Users/hassn/skillfind/.git/index.lock") { 
    Remove-Item "C:/Users/hassn/skillfind/.git/index.lock" -Force 
}

# Use Move-Item explicitly
Write-Host "Moving jobs..."
if (Test-Path "src/app/[locale]/pro/pro/jobs") {
    Move-Item "src/app/[locale]/pro/pro/jobs" "src/app/[locale]/pro/jobs" -Force
}

Write-Host "Moving offers..."
if (Test-Path "src/app/[locale]/pro/pro/offers") {
    Move-Item "src/app/[locale]/pro/pro/offers" "src/app/[locale]/pro/offers" -Force
}

Write-Host "Moving profile..."
if (Test-Path "src/app/[locale]/pro/pro/profile") {
    Move-Item "src/app/[locale]/pro/pro/profile" "src/app/[locale]/pro/profile" -Force
}

Write-Host "Moving requests..."
if (Test-Path "src/app/[locale]/pro/pro/requests") {
    Move-Item "src/app/[locale]/pro/pro/requests" "src/app/[locale]/pro/requests" -Force
}

Write-Host "Moving wallet..."
if (Test-Path "src/app/[locale]/pro/pro/wallet") {
    Move-Item "src/app/[locale]/pro/pro/wallet" "src/app/[locale]/pro/wallet" -Force
}

Write-Host "Removing empty directory..."
if (Test-Path "src/app/[locale]/pro/pro") {
    Remove-Item src/app/[locale]/pro/pro -Force -Recurse
}

Write-Host "Staging changes..."
git add .

Write-Host "Committing..."
git commit -m "Fix: Correctly move all pro files out of nested pro/pro directory"

Write-Host "Pushing..."
git push origin main
