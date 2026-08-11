const mongoose = require('mongoose');

const cronJobStateSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    lockedAt: {
      type: Date,
      default: null
    },
    lockedBy: {
      type: String, // E.g., process ID or hostname
      default: null
    },
    lastRunAt: {
      type: Date,
      default: null
    },
    lastFinishedAt: {
      type: Date,
      default: null
    },
    lastStatus: {
      type: String,
      enum: ['success', 'failed', 'running', null],
      default: null
    },
    lastError: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('CronJobState', cronJobStateSchema);
