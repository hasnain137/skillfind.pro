
import fs from 'fs';
import path from 'path';

function flattenObject(obj: any, prefix = '') {
    return Object.keys(obj).reduce((acc: any, k) => {
        const pre = prefix.length ? prefix + '.' : '';
        if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
            Object.assign(acc, flattenObject(obj[k], pre + k));
        } else {
            acc[pre + k] = obj[k];
        }
        return acc;
    }, {});
}

async function main() {
    const enPath = path.join(process.cwd(), 'messages', 'en.json');
    const frPath = path.join(process.cwd(), 'messages', 'fr.json');

    if (!fs.existsSync(enPath) || !fs.existsSync(frPath)) {
        console.error('❌ Missing translation files!');
        process.exit(1);
    }

    const en = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
    const fr = JSON.parse(fs.readFileSync(frPath, 'utf-8'));

    const enKeys = Object.keys(flattenObject(en));
    const frKeys = Object.keys(flattenObject(fr));

    const missingInFr = enKeys.filter(k => !frKeys.includes(k));
    const extraInFr = frKeys.filter(k => !enKeys.includes(k));

    if (missingInFr.length > 0) {
        console.error('❌ Missing translations in FR:');
        missingInFr.forEach(k => console.log(`  - ${k}`));
        process.exit(1);
    }

    if (extraInFr.length > 0) {
        console.warn('⚠️  Extra keys in FR (not in EN):');
        extraInFr.forEach(k => console.log(`  - ${k}`));
    }

    console.log('✅ All translations are synced!');
}

main();
