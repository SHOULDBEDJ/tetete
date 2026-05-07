import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  const res = await client.execute("SELECT id, username, full_name FROM profiles;");
  console.log('Profiles in Turso:', res.rows);
  
  const roles = await client.execute("SELECT * FROM user_roles;");
  console.log('Roles in Turso:', roles.rows);
}

main().catch(console.error);
