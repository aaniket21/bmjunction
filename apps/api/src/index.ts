import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import authRouter from './auth';
import workerRouter from './worker';
import adminRouter from './admin';
import searchRouter from './search';
import leadRouter from './lead';
import paymentRouter from './payment';
import reviewRouter from './review';
import bookingRouter from './booking';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window per IP
  message: { error: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/auth', authLimiter, authRouter);
app.use('/worker', workerRouter);
app.use('/admin', adminRouter);
app.use('/search', searchRouter);
app.use('/lead', leadRouter);
app.use('/payment', paymentRouter);
app.use('/review', reviewRouter);
app.use('/booking', bookingRouter);

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'API is running' });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
