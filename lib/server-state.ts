// Global in-memory state for reducing Firestore reads/writes
// Uses globalThis to ensure singleton state across hot-reloads and API routes

interface ServerState {
  hasPending: boolean;
  lastPendingCheck: number;
  readerLastSeen: number | null;
  historyCache: {
    data: any;
    timestamp: number;
  } | null;
  lastCleanupTime: number;
}

const globalForState = globalThis as unknown as {
  __smsServerState?: ServerState;
};

export const serverState: ServerState = globalForState.__smsServerState || {
  hasPending: true, // Start with true to check DB on startup
  lastPendingCheck: 0,
  readerLastSeen: null,
  historyCache: null,
  lastCleanupTime: 0,
};

if (process.env.NODE_ENV !== "production") {
  globalForState.__smsServerState = serverState;
}

// Mark that a new message was added (invalidates cache and signals pending messages)
export function notifyNewMessage() {
  serverState.hasPending = true;
  serverState.historyCache = null; // Invalidate history cache so dashboard shows it immediately
}

// Update reader heartbeat in memory
export function recordReaderHeartbeat() {
  serverState.readerLastSeen = Date.now();
}

// Get reader last seen timestamp
export function getReaderLastSeen(): number | null {
  return serverState.readerLastSeen;
}

// Invalidate history cache
export function invalidateHistoryCache() {
  serverState.historyCache = null;
}
