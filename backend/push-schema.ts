import { createClient } from '@libsql/client';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  const buf = fs.readFileSync('schema.sql');
  const sql = buf.toString('utf16le').replace(/^\uFEFF/, '');
  
  console.log('SQL starts with:', sql.slice(0, 100));

  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s !== '');

  console.log(`Found ${statements.length} statements to execute.`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    try {
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      await client.execute(statement);
    } catch (e: any) {
      if (e.message.includes('already exists')) {
          console.log(`Object ${i + 1} already exists.`);
      } else {
          console.error(`Error in statement ${i + 1}:`, statement);
          console.error(e.message);
      }
    }
  }

  console.log('✅ Schema push process finished.');
}

main().catch(console.error);
