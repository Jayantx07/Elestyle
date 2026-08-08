const express = require('express');
const router = express.Router();
const eventService = require('../services/eventService');

// SSE Endpoint: /api/v1/events/:channel
router.get('/:channel', (req, res) => {
  const { channel } = req.params;

  // Set headers for Server-Sent Events
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    // Nginx buffering disabled
    'X-Accel-Buffering': 'no'
  });

  // Send an initial connected ping
  res.write(`event: connected\ndata: ${JSON.stringify({ message: 'Connected to channel: ' + channel })}\n\n`);

  // Add the client response to the event service
  eventService.addClient(channel, res);

  // Client disconnected gracefully or violently
  req.on('close', () => {
    res.end();
  });
});

module.exports = router;
