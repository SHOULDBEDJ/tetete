import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import * as dotenv from 'dotenv';

dotenv.config();

const adapter = new PrismaLibSQL({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const prisma = new PrismaClient({ adapter });
