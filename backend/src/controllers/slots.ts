import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const slotSchema = z.object({
  name: z.string().min(1),
  startTime: z.string(),
  endTime: z.string(),
  isOvernight: z.boolean().default(false),
  isDefault: z.boolean().default(false),
  color: z.string(),
});

const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const checkOverlap = (s1: any, s2: any) => {
  const start1 = timeToMinutes(s1.startTime);
  let end1 = timeToMinutes(s1.endTime);
  if (s1.isOvernight || end1 <= start1) end1 += 1440;

  const start2 = timeToMinutes(s2.startTime);
  let end2 = timeToMinutes(s2.endTime);
  if (s2.isOvernight || end2 <= start2) end2 += 1440;

  // Simple intersection check for two periods
  // If either is overnight, we technically have [s, 1440] and [0, e]
  // But treating it as [s, s+duration] works if we also check modulo 1440 overlaps
  // A better way: check if [start1, end1] overlaps with [start2, end2]
  // AND [start1, end1] overlaps with [start2+1440, end2+1440] (if either is overnight)
  
  const overlaps = (a: [number, number], b: [number, number]) => {
    return Math.max(a[0], b[0]) < Math.min(a[1], b[1]);
  };

  const i1: [number, number] = [start1, end1];
  const i2: [number, number] = [start2, end2];

  if (overlaps(i1, i2)) return true;
  if (overlaps(i1, [start2 - 1440, end2 - 1440])) return true;
  if (overlaps(i1, [start2 + 1440, end2 + 1440])) return true;

  return false;
};

export const getSlots = async (req: Request, res: Response) => {
  try {
    const slots = await prisma.timeSlot.findMany({
      where: { deletedAt: null },
      orderBy: { startTime: 'asc' },
    });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
};

export const createSlot = async (req: Request, res: Response) => {
  try {
    const data = slotSchema.parse(req.body);
    
    // Check overlap
    const existing = await prisma.timeSlot.findMany({ where: { deletedAt: null } });
    for (const s of existing) {
      if (checkOverlap(data, s)) {
        return res.status(400).json({ error: `Time slot overlaps with existing slot: ${s.name} (${s.startTime}-${s.endTime})` });
      }
    }

    const slot = await prisma.timeSlot.create({ data });
    res.status(201).json(slot);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    res.status(500).json({ error: 'Failed to create slot' });
  }
};

export const updateSlot = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const data = slotSchema.partial().parse(req.body);
    
    // Check overlap
    if (data.startTime || data.endTime || data.isOvernight !== undefined) {
      const current = await prisma.timeSlot.findUnique({ where: { id } });
      if (!current) return res.status(404).json({ error: 'Slot not found' });
      
      const merged = { ...current, ...data };
      const existing = await prisma.timeSlot.findMany({ where: { deletedAt: null, id: { not: id } } });
      for (const s of existing) {
        if (checkOverlap(merged, s)) {
          return res.status(400).json({ error: `Time slot overlaps with existing slot: ${s.name} (${s.startTime}-${s.endTime})` });
        }
      }
    }

    const slot = await prisma.timeSlot.update({
      where: { id },
      data,
    });
    res.json(slot);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    res.status(500).json({ error: 'Failed to update slot' });
  }
};

export const deleteSlot = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // Soft delete
    await prisma.timeSlot.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete slot' });
  }
};
