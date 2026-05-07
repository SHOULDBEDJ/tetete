import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getActivityLogs = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
};

export const createActivityLog = async (req: Request, res: Response) => {
  const { action, module, detail } = req.body;
  const username = (req as any).user?.username || 'System';
  try {
    const log = await prisma.activityLog.create({
      data: {
        action,
        module,
        detail,
        username,
        ipAddress: req.ip,
      },
    });
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create log' });
  }
};
