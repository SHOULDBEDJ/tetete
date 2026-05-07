import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const settingsSchema = z.object({
  farmhouseName: z.string().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  businessName: z.string().nullable().optional(),
  businessPhone: z.string().nullable().optional(),
  businessEmail: z.string().nullable().optional(),
  businessAddress: z.string().nullable().optional(),
  gstNumber: z.string().nullable().optional(),
  taxPercent: z.number().nullable().optional(),
  defaultSlotId: z.string().nullable().optional(),
  defaultBookingNotes: z.string().nullable().optional(),
  notifyBookings: z.boolean().optional(),
  notifyPayments: z.boolean().optional(),
  notifyDailySummary: z.boolean().optional(),
});

export const getSettings = async (req: Request, res: Response) => {
  try {
    let settings = await prisma.setting.findFirst();
    if (!settings) {
      settings = await prisma.setting.create({
        data: {
          id: 1,
          farmhouseName: '16 Eyes Farm House',
          notifyBookings: true,
          notifyPayments: true,
          notifyDailySummary: true,
        },
      });
    }
    res.json(settings);
  } catch (error: any) {
    console.error('SETTINGS FETCH ERROR:', error.message);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const data = settingsSchema.parse(req.body);
    let settings = await prisma.setting.findFirst();
    
    if (!settings) {
      settings = await prisma.setting.create({
        data: {
          ...data,
          id: 1,
          farmhouseName: data.farmhouseName || '16 Eyes Farm House'
        }
      });
    } else {
      settings = await prisma.setting.update({
        where: { id: settings.id },
        data,
      });
    }
    res.json(settings);
  } catch (error: any) {
    console.error('SETTINGS UPDATE ERROR:', error.message);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};
