const mongoose = require('mongoose');

const razorpayWebhookEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['received', 'processed', 'failed'],
      default: 'received',
    },
    receivedAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: {
      type: Date,
    },
    error: {
      type: String,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const RazorpayWebhookEvent = mongoose.model('RazorpayWebhookEvent', razorpayWebhookEventSchema);

module.exports = RazorpayWebhookEvent;
