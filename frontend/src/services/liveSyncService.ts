type LiveSyncEvent = {
  version: string;
  correlationId: string;
  type: string;
  timestamp: number;
  entity?: string;
  entityId?: string;
};

type EventCallback = (event: LiveSyncEvent) => void;

class LiveSyncService {
  private eventSource: EventSource | null = null;
  private listeners: Set<EventCallback> = new Set();
  // Keep track of bound functions to removeEventListener properly
  private boundEventHandlers: Map<string, (e: any) => void> = new Map();
  private channel: string;
  private retryCount = 0;
  private maxRetries = 10;
  private baseDelay = 1000;
  private reconnectTimeout: number | null = null;
  private isIntentionalClose = false;

  // Operational metrics
  private metrics = {
    eventsReceived: 0,
    reconnectAttempts: 0,
    lastHeartbeat: 0,
  };

  constructor(channel: string = 'catalog') {
    this.channel = channel;
  }

  public connect() {
    if (this.eventSource || this.isIntentionalClose) return;

    // Use the backend SSE endpoint
    this.eventSource = new EventSource(`/api/v1/events/${this.channel}`);

    this.eventSource.onopen = () => {
      console.log(`[LiveSyncService] Connected to channel: ${this.channel}`);
      this.retryCount = 0;
      this.logMetric('SSE_CONNECTED', { channel: this.channel });
    };

    // Generic fallback listener for unnamed events
    const genericHandler = (event: MessageEvent) => this.handleMessage(event.data);
    this.eventSource.onmessage = genericHandler;
    this.boundEventHandlers.set('message', genericHandler);

    // Listen to explicitly named events
    const eventsToListen = [
      'catalog_updated',
      'category_updated',
      'category_bulk_updated',
      'subcategory_updated',
      'subcategory_bulk_updated',
      'landingBanner_updated',
      'landingBanner_bulk_updated',
      'ping',
      'connected',
    ];

    eventsToListen.forEach((eventName) => {
      const handler = (event: MessageEvent) => this.handleMessage(event.data);
      this.eventSource?.addEventListener(eventName, handler);
      this.boundEventHandlers.set(eventName, handler);
    });

    const errorHandler = (err: Event) => {
      console.warn('[LiveSyncService] Connection error:', err);
      this.logMetric('SSE_DISCONNECTED', { error: true });
      this.scheduleReconnect();
    };
    this.eventSource.onerror = errorHandler;
    this.boundEventHandlers.set('error', errorHandler);
  }

  private handleMessage(data: string) {
    try {
      const parsedData: LiveSyncEvent = JSON.parse(data);
      
      if (parsedData.type === 'ping') {
        const latency = Date.now() - parsedData.timestamp;
        this.metrics.lastHeartbeat = Date.now();
        this.logMetric('HEARTBEAT_LATENCY', { latencyMs: latency });
        return;
      }
      
      if (parsedData.type !== 'connected') {
        this.metrics.eventsReceived++;
        this.logMetric('EVENT_RECEIVED', { type: parsedData.type, entity: parsedData.entity });
        this.notifyListeners(parsedData);
      }
    } catch (e) {
      console.error('[LiveSyncService] Error parsing event data:', e);
    }
  }

  private scheduleReconnect() {
    this.close(false); // Close silently

    if (this.retryCount >= this.maxRetries) {
      console.error('[LiveSyncService] Max reconnection attempts reached.');
      return;
    }

    const delay = this.baseDelay * Math.pow(2, this.retryCount) * (0.8 + Math.random() * 0.4);
    this.retryCount++;
    this.metrics.reconnectAttempts++;
    
    this.logMetric('SSE_RECONNECT_ATTEMPT', { attempt: this.retryCount, delayMs: delay.toFixed(0) });
    console.log(`[LiveSyncService] Reconnecting in ${delay.toFixed(0)}ms (Attempt ${this.retryCount})`);

    this.reconnectTimeout = window.setTimeout(() => {
      this.connect();
    }, delay);
  }

  public close(intentional = true) {
    if (intentional) {
      this.isIntentionalClose = true;
    }
    
    if (this.eventSource) {
      // Memory Leak Prevention: Strict listener removal
      this.boundEventHandlers.forEach((handler, eventName) => {
        if (eventName === 'message') {
          this.eventSource!.onmessage = null;
        } else if (eventName === 'error') {
          this.eventSource!.onerror = null;
        } else {
          this.eventSource!.removeEventListener(eventName, handler);
        }
      });
      this.boundEventHandlers.clear();
      
      this.eventSource.close();
      this.eventSource = null;
      this.logMetric('SSE_DISCONNECTED', { intentional });
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  public subscribe(callback: EventCallback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(event: LiveSyncEvent) {
    this.listeners.forEach((cb) => cb(event));
  }

  private logMetric(name: string, payload: any = {}) {
    // Basic telemetry logic. In production, this could push to Datadog/Sentry
    const metricStr = JSON.stringify({ metric: name, timestamp: new Date().toISOString(), ...payload });
    console.debug(`[Telemetry] ${metricStr}`);
  }
}

// Singleton instance for the catalog channel
export const catalogSyncService = new LiveSyncService('catalog');
