const { EventEmitter } = require('events');
const crypto = require('crypto');

/**
 * Scalable SSE Event Service
 * Isolates live synchronization transport from business logic.
 * Currently backed by in-memory EventEmitter, designed to be swapped with Redis Pub/Sub later.
 */
class EventService extends EventEmitter {
  constructor() {
    super();
    this.clients = new Map(); // channel -> Set of Response objects
    this.coalescingTimeouts = new Map();
    
    // Heartbeat mechanism to keep SSE connections alive
    setInterval(() => this.broadcastHeartbeat(), 30000);
  }

  /**
   * Adds a new client connection to a specific channel
   */
  addClient(channel, res) {
    if (!this.clients.has(channel)) {
      this.clients.set(channel, new Set());
    }
    this.clients.get(channel).add(res);

    res.on('close', () => {
      this.clients.get(channel).delete(res);
      if (this.clients.get(channel).size === 0) {
        this.clients.delete(channel);
      }
    });
  }

  /**
   * Broadcasts a payload to all connected clients on a specific channel
   */
  broadcast(channel, eventType, payload = {}) {
    const clients = this.clients.get(channel);
    if (!clients || clients.size === 0) return;

    const data = JSON.stringify({
      version: '1.0',
      correlationId: crypto.randomUUID(),
      type: eventType,
      timestamp: Date.now(),
      ...payload
    });

    for (const res of clients) {
      res.write(`event: ${eventType}\n`);
      res.write(`data: ${data}\n\n`);
      
      // Attempt to flush if compression middleware is present
      if (res.flush) res.flush();
    }
  }

  /**
   * Dispatches an invalidation event. Coalesces rapid sequential calls to prevent event storms.
   */
  dispatchInvalidation(channel, entity, entityId = null) {
    // Unique key for debouncing (e.g., 'catalog:subcategory:bulk' vs 'catalog:subcategory:123')
    const debounceKey = `${channel}:${entity}:${entityId || 'bulk'}`;
    
    if (this.coalescingTimeouts.has(debounceKey)) {
      clearTimeout(this.coalescingTimeouts.get(debounceKey));
    }

    const timeout = setTimeout(() => {
      this.coalescingTimeouts.delete(debounceKey);
      
      // If we don't have an ID, it's a bulk operation. Send bulk event.
      const eventType = entityId ? `${entity}_updated` : `${entity}_bulk_updated`;
      this.broadcast(channel, eventType, { entity, entityId });
      
    }, 500); // 500ms debounce window

    this.coalescingTimeouts.set(debounceKey, timeout);
  }

  /**
   * Sends a ping heartbeat to all connected clients across all channels
   */
  broadcastHeartbeat() {
    const data = JSON.stringify({ type: 'ping', timestamp: Date.now() });
    
    for (const [channel, clients] of this.clients.entries()) {
      for (const res of clients) {
        res.write(`event: ping\n`);
        res.write(`data: ${data}\n\n`);
        if (res.flush) res.flush();
      }
    }
  }
}

const eventService = new EventService();
module.exports = eventService;
