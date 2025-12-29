const fs = require('fs');
const en = require('./messages/en.json');
const fr = require('./messages/fr.json');

function getKeys(obj, prefix = '') {
    let keys = [];
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            keys = keys.concat(getKeys(obj[key], prefix + key + '.'));
        } else {
            keys.push(prefix + key);
        }
    }
    return keys;
}

const enKeys = getKeys(en);
const frKeys = getKeys(fr);

const missingInFr = enKeys.filter(key => !frKeys.includes(key));
const missingInEn = frKeys.filter(key => !enKeys.includes(key));

console.log('Missing in FR:', missingInFr);
console.log('Missing in EN:', missingInEn);
console.log('Encoding check (first 100 chars of fr):', JSON.stringify(fr).substring(0, 100));
