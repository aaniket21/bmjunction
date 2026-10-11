import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get workers by category with optional search/filter
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { trade, search, area } = req.query;

    const workers = await prisma.worker.findMany({
      where: {
        verified: true, // Only show verified workers
        ...(trade && { trade: trade as string }),
        ...(area && { area: { contains: area as string, mode: 'insensitive' } }),
        ...(search && {
          OR: [
            { name: { contains: search as string, mode: 'insensitive' } },
            { about: { contains: search as string, mode: 'insensitive' } },
          ],
        }),
      },
      select: {
        id: true,
        name: true,
        trade: true,
        experience: true,
        area: true,
        about: true,
        verified: true,
        isFeatured: true,
        averageRating: true,
        totalReviews: true,
      },
      orderBy: [
        { isFeatured: 'desc' },
        { averageRating: 'desc' },
      ],
    });

    res.json({ workers });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
