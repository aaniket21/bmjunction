import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Create a new booking
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { workerId, customerName, customerPhone, date, amount } = req.body;

    if (!workerId || !customerName || !customerPhone || !date || !amount) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const booking = await prisma.booking.create({
      data: {
        workerId,
        customerName,
        customerPhone,
        date: new Date(date),
        amount: parseInt(amount),
        status: 'PENDING',
        escrowStatus: 'HELD'
      }
    });

    res.json({ success: true, booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mock an escrow release (complete booking)
router.post('/:id/complete', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        escrowStatus: 'RELEASED'
      }
    });

    res.json({ success: true, message: 'Booking completed and funds released to worker', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get bookings for a worker
router.get('/:workerId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { workerId } = req.params;
    const bookings = await prisma.booking.findMany({
      where: { workerId },
      orderBy: { date: 'asc' }
    });
    res.json({ success: true, bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
