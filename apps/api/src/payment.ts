import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { authenticate, AuthRequest } from './middleware';

const router = Router();
const prisma = new PrismaClient();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
});

const FEATURED_PRICE_INR = 499;

// Create order for Featured Listing
router.post('/create-order', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workerId = req.user?.id;
    if (!workerId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const options = {
      amount: FEATURED_PRICE_INR * 100, // amount in smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    // Create a payment record
    await prisma.payment.create({
      data: {
        workerId,
        razorpayOrderId: order.id,
        amount: FEATURED_PRICE_INR,
      }
    });

    res.json({ orderId: order.id, amount: options.amount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify payment
router.post('/verify', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workerId = req.user?.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!workerId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret';
    const expectedSignature = crypto.createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Payment is successful
      await prisma.payment.update({
        where: { razorpayOrderId: razorpay_order_id },
        data: {
          razorpayPaymentId: razorpay_payment_id,
          status: 'SUCCESS',
        }
      });

      // Update worker to be featured for 30 days
      const featuredUntil = new Date();
      featuredUntil.setDate(featuredUntil.getDate() + 30);

      await prisma.worker.update({
        where: { id: workerId },
        data: {
          isFeatured: true,
          featuredUntil,
        }
      });

      res.json({ success: true, message: 'Payment verified successfully. You are now featured!' });
    } else {
      res.status(400).json({ error: 'Invalid signature' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

export default router;
