
import fs from 'fs';
import path from 'path';

function pseudoLocalizeString(str: string): string {
    // Simple mapping
    const map: Record<string, string> = {
        a: 'à', b: 'ƀ', c: 'ç', d: 'ð', e: 'é', f: 'ƒ', g: 'ĝ', h: 'ĥ', i: 'î', j: 'ĵ', k: 'ķ', l: 'ļ',
        m: 'ɱ', n: 'ñ', o: 'ô', p: 'þ', q: 'ǫ', r: 'ŕ', s: 'š', t: 'ţ', u: 'û', v: 'ṽ', w: 'ŵ', x: 'ẋ', y: 'ý', z: 'ž',
        A: 'À', B: 'Ɓ', C: 'Ç', D: 'Ð', E: 'É', F: 'Ƒ', G: 'Ĝ', H: 'Ĥ', I: 'Î', J: 'Ĵ', K: 'Ķ', L: 'Ļ',
        M: 'Ṁ', N: 'Ñ', O: 'Ô', P: 'Þ', Q: 'Ǫ', R: 'Ŕ', S: 'Š', T: 'Ţ', U: 'Û', V: 'Ṽ', W: 'Ŵ', X: 'Ẋ', Y: 'Ý', Z: 'Ž'
    };

    // Expand text by ~30% to simulate German etc.
    const expanded = str.split('').map(c => map[c] || c).join('');
    return `[!!! ${expanded} !!!]`;
}

function traverseAndLocalize(obj: any): any {
    if (typeof obj === 'string') {
        return pseudoLocalizeString(obj);
    } else if (typeof obj === 'object' && obj !== null) {
        const newObj: any = {};
        for (const key in obj) {
            newObj[key] = traverseAndLocalize(obj[key]);
        }
        return newObj;
    }
    return obj;
}

async function main() {
    const enPath = path.join(process.cwd(), 'messages', 'en.json');
    const outPath = path.join(process.cwd(), 'messages', 'en-XA.json');

    if (!fs.existsSync(enPath)) {
        console.error('❌ Source file messages/en.json not found.');
        process.exit(1);
    }

    const enContent = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
    const pseudoContent = traverseAndLocalize(enContent);

    fs.writeFileSync(outPath, JSON.stringify(pseudoContent, null, 4));
    console.log(`✅ Generated pseudo-localization at: ${outPath}`);
    console.log('👉 To use, add "en-XA" to your generic routing locales.');
}

main();
