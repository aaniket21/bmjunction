import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';

// Note: In a real app, we would add an @authenticateAdmin middleware here.
const router = Router();
const prisma = new PrismaClient();

// Get unverified workers
router.get('/unverified', async (req, res): Promise<void> => {
  try {
    const workers = await prisma.worker.findMany({
      where: { verified: false },
      select: {
        id: true,
        name: true,
        trade: true,
        experience: true,
        area: true,
        phone: true,
        createdAt: true,
      }
    });

    res.json({ workers });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve a worker
router.put('/:id/approve', async (req, res): Promise<void> => {
  try {
    const { id } = req.params;

    const worker = await prisma.worker.update({
      where: { id },
      data: { verified: true },
    });

    res.json({ success: true, worker });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
