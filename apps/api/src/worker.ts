import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import sanitizeHtml from 'sanitize-html';
import { authenticate, AuthRequest } from './middleware';

const router = Router();
const prisma = new PrismaClient();

function sanitizeText(text: string): string {
  return sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} });
}

// Get worker profile
router.get('/profile', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workerId = req.user?.id;
    const worker = await prisma.worker.findUnique({
      where: { id: workerId },
      select: {
        id: true,
        name: true,
        trade: true,
        experience: true,
        area: true,
        phone: true,
        about: true,
        verified: true,
        createdAt: true,
      }
    });

    if (!worker) {
      res.status(404).json({ error: 'Worker not found' });
      return;
    }

    res.json({ worker });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update worker profile
router.put('/profile', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workerId = req.user?.id;
    const { name, experience, area, about } = req.body;

    const worker = await prisma.worker.update({
      where: { id: workerId },
      data: {
        ...(name && { name: sanitizeText(name) }),
        ...(experience && { experience: Number(experience) }),
        ...(area && { area: sanitizeText(area) }),
        ...(about !== undefined && { about: sanitizeText(about) }),
      },
      select: {
        id: true,
        name: true,
        trade: true,
        experience: true,
        area: true,
        phone: true,
        about: true,
        verified: true,
      }
    });

    res.json({ worker });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get leads for the logged-in worker
router.get('/leads', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workerId = req.user?.id;
    const leads = await prisma.lead.findMany({
      where: { workerId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ leads });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

