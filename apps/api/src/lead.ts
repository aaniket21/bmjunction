import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Log a lead (contact click)
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { workerId, type } = req.body;

    if (!workerId || !type) {
      res.status(400).json({ error: 'workerId and type are required' });
      return;
    }

    const lead = await prisma.lead.create({
      data: {
        workerId,
        type, // 'call' or 'whatsapp'
      }
    });

    // Notify the worker via Push Notification
    // In a real app, we would fetch the worker's expoPushToken from the database
    // and send a request to https://exp.host/--/api/v2/push/send
    console.log(`[PUSH NOTIFICATION] Sending push to Worker ${workerId}: You have a new ${type} lead!`);

    res.json({ success: true, lead });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
