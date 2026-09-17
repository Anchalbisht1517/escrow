import 'dotenv/config';
import crypto from 'crypto';

const orderId = 'order_TEQNfWUOQJuRMX';
const paymentId = 'pay_TestPayment12345';

const signature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(orderId + '|' + paymentId)
  .digest('hex');

console.log('orderId:', orderId);
console.log('paymentId:', paymentId);
console.log('signature:', signature);
