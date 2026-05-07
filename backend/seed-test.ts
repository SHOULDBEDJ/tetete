import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const adapter = new PrismaLibSQL({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
  const prisma = new PrismaClient({ adapter });

  const hashedPassword = await bcrypt.hash('123456', 10);
  
  await prisma.profile.upsert({
    where: { username: 'testadmin' },
    update: { password: hashedPassword },
    create: {
      username: 'testadmin',
      password: hashedPassword,
      fullName: 'Test Admin',
      status: 'Active',
      roles: {
        create: [
          {
            role: 'SuperAdmin',
            permissions: { all: true },
          },
        ],
      },
    },
  });

  console.log('Test user created: testadmin / 123456');
  await prisma.$disconnect();
}

main().catch(console.error);
