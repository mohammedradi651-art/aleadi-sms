// Global in-memory state for managing SSE Connections
// Uses globalThis to ensure singleton state across hot-reloads and API routes

export type MessageType = {
  id: string;
  phone: string;
  message: string;
  createdAt: number;
  status: string;
  deliveredAt?: number;
};

interface ServerState {
  readerStreams: Set<ReadableStreamDefaultController<any>>;
  dashboardStreams: Set<ReadableStreamDefaultController<any>>;
  lastCleanupTime: number;
}

const globalForState = globalThis as unknown as {
  __smsServerState?: ServerState;
  __smsMaintenanceMode?: boolean;
};

export const serverState: ServerState = globalForState.__smsServerState || {
  readerStreams: new Set(),
  dashboardStreams: new Set(),
  lastCleanupTime: 0,
};

export function isMaintenanceMode(): boolean {
  return globalForState.__smsMaintenanceMode ?? false;
}

export function setMaintenanceMode(mode: boolean) {
  globalForState.__smsMaintenanceMode = mode;
  pushUpdateToDashboards({ type: "MAINTENANCE_STATUS", maintenanceMode: mode });
}

if (process.env.NODE_ENV !== "production") {
  globalForState.__smsServerState = serverState;
}

// Check if reader is connected
export function isReaderConnected(): boolean {
  return serverState.readerStreams.size > 0;
}

// Push message to all active readers
export function pushMessageToReaders(message: MessageType) {
  const data = `data: ${JSON.stringify(message)}\n\n`;
  const encoded = new TextEncoder().encode(data);
  serverState.readerStreams.forEach((controller) => {
    try {
      controller.enqueue(encoded);
    } catch (e) {
      console.error("Error sending to reader stream", e);
    }
  });
}

// Push updates to dashboards (status change, new message, etc)
export function pushUpdateToDashboards(payload: any) {
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  const encoded = new TextEncoder().encode(data);
  serverState.dashboardStreams.forEach((controller) => {
    try {
      controller.enqueue(encoded);
    } catch (e) {
      console.error("Error sending to dashboard stream", e);
    }
  });
}

// Notify dashboards about reader connection status change
export function notifyDashboardsReaderStatus() {
  pushUpdateToDashboards({ type: "READER_STATUS", connected: isReaderConnected() });
}
