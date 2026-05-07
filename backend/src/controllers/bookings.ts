import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const bookingSchema = z.object({
  customerName: z.string().min(1),
  mobile: z.string().min(10),
  bookingDate: z.string(),
  slotId: z.string(),
  guests: z.number().int().positive().default(1),
  advancePaid: z.number().nonnegative().default(0),
  agreedTotal: z.number().nonnegative().default(0),
  discount: z.number().nonnegative().default(0),
  idProofType: z.enum(['Aadhaar', 'PAN', 'Passport', 'DL', 'VoterID']).optional(),
  idProofNumber: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['Confirmed', 'Pending', 'Cancelled']).default('Pending'),
});

export const getBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { deletedAt: null },
      include: { slot: true },
      orderBy: { bookingDate: 'desc' },
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

export const createBooking = async (req: Request, res: Response) => {
  try {
    const data = bookingSchema.parse(req.body);
    const booking = await prisma.booking.create({
      data: {
        ...data,
        bookingDate: new Date(data.bookingDate),
        createdBy: (req as any).user?.id, // Assuming auth middleware sets this
      },
    });
    res.status(201).json(booking);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

export const updateBooking = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const data = bookingSchema.partial().parse(req.body);
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        ...data,
        bookingDate: data.bookingDate ? new Date(data.bookingDate) : undefined,
      },
    });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking' });
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.booking.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete booking' });
  }
};
