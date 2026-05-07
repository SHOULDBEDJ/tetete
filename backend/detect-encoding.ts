import fs from 'fs';

const buf = fs.readFileSync('schema.sql');
console.log('Buffer length:', buf.length);
console.log('Hex:', buf.slice(0, 20).toString('hex'));
console.log('UTF-8:', buf.toString('utf8').slice(0, 50));
console.log('UTF-16LE:', buf.toString('utf16le').slice(0, 50));
