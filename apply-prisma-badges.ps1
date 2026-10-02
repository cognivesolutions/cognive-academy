Set-Location "C:\Users\vishwajeet.singh\Documents\Visual Studio Code\cognive-academy"
Write-Host "Applying Prisma schema to local database..."
npx prisma db push
Write-Host "Prisma schema synced."
