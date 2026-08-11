const RazorpayWebhookEvent = require('../models/RazorpayWebhookEvent');
const paymentService = require('../services/paymentService');
const paymentFinalizationService = require('../services/paymentFinalizationService');
const Order = require('../models/Order');
const refundService = require('../services/refundService');

exports.handleWebhook = async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  
  if (!signature) {
    return res.status(400).send('Missing signature');
  }

  try {
    // 1. Verify Signature using raw body
    const isValid = paymentService.verifyWebhookSignature(req.body, signature);
    if (!isValid) {
      return res.status(400).send('Invalid signature');
    }

    // Parse the JSON now that signature is verified
    const payload = JSON.parse(req.body.toString());
    const eventId = req.headers['x-razorpay-event-id'] || payload.id || `webhook_${Date.now()}`;
    const eventType = payload.event;

    // 2. Idempotency Check
    const existingEvent = await RazorpayWebhookEvent.findOne({ eventId });
    if (existingEvent) {
      // Already received, return 200 to acknowledge retry
      return res.status(200).send('OK');
    }

    // 3. Persist Event Durably
    const eventRecord = await RazorpayWebhookEvent.create({
      eventId,
      eventType,
      status: 'received'
    });

    // 4. Return HTTP 200 Quickly
    res.status(200).send('OK');

    // 5. Asynchronous Business Logic Processing
    // We run this immediately but don't wait for it in the HTTP response
    setImmediate(async () => {
      try {
        if (eventType === 'payment.captured') {
          const paymentEntity = payload.payload.payment.entity;
          const orderId = paymentEntity.order_id;
          
          const order = await Order.findOne({ 'payment.razorpayOrderId': orderId });
          if (order) {
            const paymentData = {
              razorpayPaymentId: paymentEntity.id,
              method: paymentEntity.method,
              razorpaySignatureVerified: true, // implicit by webhook auth
            };
            await paymentFinalizationService.finalizeOrder(order._id, paymentData);
          }
        } else if (eventType === 'payment.failed') {
          const paymentEntity = payload.payload.payment.entity;
          const orderId = paymentEntity.order_id;
          
          const order = await Order.findOne({ 'payment.razorpayOrderId': orderId });
          if (order) {
            await paymentFinalizationService.handlePaymentFailure(order._id, paymentEntity);
          }
        } else if (['refund.created', 'refund.processed', 'refund.failed'].includes(eventType)) {
          const refundEntity = payload.payload.refund.entity;
          await refundService.syncWebhookRefund(refundEntity);
        }

        // Mark processed
        eventRecord.status = 'processed';
        eventRecord.processedAt = new Date();
        await eventRecord.save();
      } catch (error) {
        console.error(`Error processing webhook event ${eventId}:`, error);
        eventRecord.status = 'failed';
        eventRecord.error = error.message;
        await eventRecord.save();
      }
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    // Even on server errors parsing the payload, return 400 so razorpay doesn't blindly retry unparseable data indefinitely
    res.status(400).send('Webhook error');
  }
};
