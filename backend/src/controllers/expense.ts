import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const expenseSchema = z.object({
  date: z.string().optional(),
  typeId: z.string(),
  amount: z.number().positive(),
  vendor: z.string().optional(),
  description: z.string().optional(),
  paymentMode: z.enum(['UPI', 'Cash', 'Cheque', 'BankTransfer', 'Other']).default('Cash'),
  reference: z.string().optional(),
});

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { deletedAt: null },
      include: { type: true },
      orderBy: { date: 'desc' },
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

export const createExpense = async (req: Request, res: Response) => {
  try {
    const data = expenseSchema.parse(req.body);
    const expense = await prisma.expense.create({
      data: {
        ...data,
        date: data.date ? new Date(data.date) : new Date(),
        createdBy: (req as any).user?.id,
      },
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create expense' });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.expense.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
};

export const getExpenseTypes = async (req: Request, res: Response) => {
  try {
    const types = await prisma.expenseType.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expense types' });
  }
};

export const createExpenseType = async (req: Request, res: Response) => {
  const { name } = req.body;
  try {
    const type = await prisma.expenseType.create({
      data: { name }
    });
    res.status(201).json(type);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create expense type' });
  }
};

export const deleteExpenseType = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // Check if in use
    const count = await prisma.expense.count({
      where: { typeId: id, deletedAt: null }
    });
    if (count > 0) {
      return res.status(400).json({ error: 'Category is in use and cannot be deleted' });
    }
    await prisma.expenseType.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete expense type' });
  }
};

export const updateExpenseType = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const type = await prisma.expenseType.update({
      where: { id },
      data: { name }
    });
    res.json(type);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update expense type' });
  }
};
