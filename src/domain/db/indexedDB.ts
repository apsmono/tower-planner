import type { Run } from '../store';

const DB_NAME = 'tower_planner_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Runs store
      if (!db.objectStoreNames.contains('runs')) {
        const runStore = db.createObjectStore('runs', { keyPath: 'id' });
        runStore.createIndex('battleDate', 'battleDate', { unique: false });
        runStore.createIndex('tier', 'tier', { unique: false });
        runStore.createIndex('contentHash', 'contentHash', { unique: false });
      }

      // 2. Outbox store for background sync queue
      if (!db.objectStoreNames.contains('outbox')) {
        db.createObjectStore('outbox', { autoIncrement: true, keyPath: 'outboxId' });
      }

      // 3. Metadata store (e.g. sync cursors)
      if (!db.objectStoreNames.contains('sync_meta')) {
        db.createObjectStore('sync_meta', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

export interface OutboxItem {
  outboxId?: number;
  type: 'upsert_run' | 'soft_delete_run' | 'update_run';
  payload: any;
  createdAt: string;
}

// ----------------- Runs Operations -----------------

export async function getAllRunsIDB(): Promise<Run[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('runs', 'readonly');
    const store = tx.objectStore('runs');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function putRunIDB(run: Run): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('runs', 'readwrite');
    const store = tx.objectStore('runs');
    const req = store.put(run);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function putRunsIDB(runs: Run[]): Promise<void> {
  if (runs.length === 0) return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('runs', 'readwrite');
    const store = tx.objectStore('runs');
    for (const run of runs) {
      store.put(run);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteRunIDB(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('runs', 'readwrite');
    const store = tx.objectStore('runs');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ----------------- Outbox Operations -----------------

export async function enqueueOutboxIDB(item: Omit<OutboxItem, 'outboxId' | 'createdAt'>): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('outbox', 'readwrite');
    const store = tx.objectStore('outbox');
    const fullItem: OutboxItem = {
      ...item,
      createdAt: new Date().toISOString()
    };
    const req = store.add(fullItem);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getOutboxItemsIDB(): Promise<OutboxItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('outbox', 'readonly');
    const store = tx.objectStore('outbox');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function removeOutboxItemIDB(outboxId: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('outbox', 'readwrite');
    const store = tx.objectStore('outbox');
    const req = store.delete(outboxId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ----------------- Sync Meta Operations -----------------

export async function getSyncMetaIDB(key: string): Promise<string | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_meta', 'readonly');
    const store = tx.objectStore('sync_meta');
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result ? req.result.value : null);
    req.onerror = () => reject(req.error);
  });
}

export async function setSyncMetaIDB(key: string, value: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_meta', 'readwrite');
    const store = tx.objectStore('sync_meta');
    const req = store.put({ key, value });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
