import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import sanitizeHtml from 'sanitize-html';

function sanitizeText(text: string): string {
  return sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} });
}

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, trade, experience, area, phone, password } = req.body;

    if (!name || !trade || !experience || !area || !phone || !password) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const existingWorker = await prisma.worker.findUnique({ where: { phone } });
    if (existingWorker) {
      res.status(400).json({ error: 'Worker with this phone already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const worker = await prisma.worker.create({
      data: {
        name: sanitizeText(name),
        trade: sanitizeText(trade),
        experience: Number(experience),
        area: sanitizeText(area),
        phone,
        password: hashedPassword,
      }
    });

    const token = jwt.sign({ id: worker.id, phone: worker.phone }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, worker: { id: worker.id, name: worker.name, phone: worker.phone } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      res.status(400).json({ error: 'Phone and password are required' });
      return;
    }

    const worker = await prisma.worker.findUnique({ where: { phone } });
    if (!worker) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isValid = await bcrypt.compare(password, worker.password);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: worker.id, phone: worker.phone }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, worker: { id: worker.id, name: worker.name, phone: worker.phone } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
