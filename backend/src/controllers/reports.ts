import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const [
      totalBookings,
      currentMonthBookings,
      lastMonthBookings,
      totalIncome,
      totalExpense,
    ] = await Promise.all([
      prisma.booking.count({ where: { deletedAt: null } }),
      prisma.booking.count({ where: { bookingDate: { gte: currentMonthStart }, deletedAt: null } }),
      prisma.booking.count({ where: { bookingDate: { gte: lastMonthStart, lte: lastMonthEnd }, deletedAt: null } }),
      prisma.income.aggregate({ where: { deletedAt: null }, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { deletedAt: null }, _sum: { amount: true } }),
    ]);

    res.json({
      totalBookings,
      currentMonthBookings,
      lastMonthBookings,
      totalIncome: totalIncome._sum.amount || 0,
      totalExpense: totalExpense._sum.amount || 0,
      netProfit: (totalIncome._sum.amount || 0) - (totalExpense._sum.amount || 0),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

export const getFullReport = async (req: Request, res: Response) => {
  const { from, to } = req.query;
  const where: any = { deletedAt: null };
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from as string);
    if (to) where.date.lte = new Date(to as string);
  }

  const bookingWhere: any = { deletedAt: null };
  if (from || to) {
    bookingWhere.bookingDate = {};
    if (from) bookingWhere.bookingDate.gte = new Date(from as string);
    if (to) bookingWhere.bookingDate.lte = new Date(to as string);
  }

  try {
    const [bookings, incomes, expenses] = await Promise.all([
      prisma.booking.findMany({
        where: bookingWhere,
        include: { slot: true },
        orderBy: { bookingDate: 'asc' },
      }),
      prisma.income.findMany({
        where: { ...where, date: where.date },
        include: { type: true },
        orderBy: { date: 'asc' },
      }),
      prisma.expense.findMany({
        where: { ...where, date: where.date },
        include: { type: true },
        orderBy: { date: 'asc' },
      }),
    ]);

    res.json({ bookings, incomes, expenses });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};
