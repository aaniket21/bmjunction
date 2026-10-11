import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Post a review
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { workerId, customerName, rating, comment } = req.body;

    if (!workerId || !customerName || rating == null) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const parsedRating = parseInt(rating);
    if (parsedRating < 1 || parsedRating > 5) {
      res.status(400).json({ error: 'Rating must be between 1 and 5' });
      return;
    }

    const review = await prisma.review.create({
      data: {
        workerId,
        customerName,
        rating: parsedRating,
        comment
      }
    });

    // Update worker's average rating and total reviews
    const aggregate = await prisma.review.aggregate({
      where: { workerId },
      _avg: { rating: true },
      _count: { rating: true }
    });

    await prisma.worker.update({
      where: { id: workerId },
      data: {
        averageRating: aggregate._avg.rating || 0,
        totalReviews: aggregate._count.rating || 0,
      }
    });

    res.json({ success: true, review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get reviews for a worker
router.get('/:workerId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { workerId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { workerId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
