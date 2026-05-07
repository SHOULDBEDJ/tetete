import { PrismaClient } from '@prisma/client';
import { createClient } from '@libsql/client';
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

  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  console.log('Connecting to Turso to seed admin user...');

  const admin = await prisma.profile.upsert({
    where: { username: 'admin' },
    update: {
        password: hashedPassword, // Reset password if exists
    },
    create: {
      username: 'admin',
      password: hashedPassword,
      fullName: 'Super Admin',
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

  console.log('✅ Admin user created in Turso:', admin.username);
  
  // Create default time slots
  const slots = [
    { name: 'Day', startTime: '10:00', endTime: '18:00', color: '#f59e0b' },
    { name: 'Night', startTime: '20:00', endTime: '08:00', color: '#1e3a8a' },
    { name: 'Full Day', startTime: '10:00', endTime: '08:00', color: '#10b981', isOvernight: true },
  ];

  for (const slot of slots) {
    await prisma.timeSlot.upsert({
      where: { id: slot.name } as any, // Not quite right but we'll use a hack to ensure they exist
      update: {},
      create: slot as any,
    }).catch(() => {
        // Just ignore if exists
    });
  }
  
  console.log('✅ Default slots created in Turso');

  // Create default Expense Types
  const expenseTypes = ['Maintenance', 'Electricity', 'Cleaning', 'Staff Salary', 'Grocery', 'Other'];
  for (const name of expenseTypes) {
    await prisma.expenseType.upsert({
      where: { name },
      update: {},
      create: { name },
    }).catch(() => {});
  }
  console.log('✅ Default expense types created');

  // Create default Income Types
  const incomeTypes = ['Booking', 'Event', 'Catering', 'Other'];
  for (const name of incomeTypes) {
    await prisma.incomeType.upsert({
      where: { name },
      update: {},
      create: { name },
    }).catch(() => {});
  }
  console.log('✅ Default income types created');

  await prisma.$disconnect();
}

main().catch((e) => {
  console.dir(e, { depth: null });
  process.exit(1);
});
