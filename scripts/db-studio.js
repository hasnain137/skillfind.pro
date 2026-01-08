
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Try to load .env manually since Prisma CLI might be failing to pick it up
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    console.log('Loading .env file...');
    require('dotenv').config({ path: envPath });
} else {
    console.warn('Warning: .env file not found at', envPath);
}

console.log('Starting Prisma Studio...');
console.log('DATABASE_URL defined:', !!process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL is missing from environment variables.');
    process.exit(1);
}

try {
    // Run prisma studio with the loaded environment
    execSync('npx prisma studio', {
        stdio: 'inherit',
        env: { ...process.env }
    });
} catch (error) {
    console.error('Failed to start studio:', error.message);
    process.exit(1);
}
