import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const incomeSchema = z.object({
  date: z.string().optional(),
  typeId: z.string(),
  amount: z.number().positive(),
  description: z.string().optional(),
  paymentMode: z.enum(['UPI', 'Cash', 'Cheque', 'BankTransfer', 'Other']).default('Cash'),
  reference: z.string().optional(),
});

export const getIncomes = async (req: Request, res: Response) => {
  try {
    const incomes = await prisma.income.findMany({
      where: { deletedAt: null },
      include: { type: true },
      orderBy: { date: 'desc' },
    });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incomes' });
  }
};

export const createIncome = async (req: Request, res: Response) => {
  try {
    const data = incomeSchema.parse(req.body);
    const income = await prisma.income.create({
      data: {
        ...data,
        date: data.date ? new Date(data.date) : new Date(),
        createdBy: (req as any).user?.id,
      },
    });
    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create income' });
  }
};

export const deleteIncome = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.income.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete income' });
  }
};

export const getIncomeTypes = async (req: Request, res: Response) => {
  try {
    const types = await prisma.incomeType.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch income types' });
  }
};

export const createIncomeType = async (req: Request, res: Response) => {
  const { name } = req.body;
  try {
    const type = await prisma.incomeType.create({
      data: { name }
    });
    res.status(201).json(type);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create income type' });
  }
};

export const deleteIncomeType = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // Check if in use
    const count = await prisma.income.count({
      where: { typeId: id, deletedAt: null }
    });
    if (count > 0) {
      return res.status(400).json({ error: 'Category is in use and cannot be deleted' });
    }
    await prisma.incomeType.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete income type' });
  }
};

export const updateIncomeType = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const type = await prisma.incomeType.update({
      where: { id },
      data: { name }
    });
    res.json(type);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update income type' });
  }
};
