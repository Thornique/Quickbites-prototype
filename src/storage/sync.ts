import type { CollectionName } from "./keys";
import { SYNC_CHANNEL, collectionKey } from "./keys";

export type SyncAction = "create" | "update" | "delete" | "reset";

export interface SyncEvent {
  collection: CollectionName;
  action: SyncAction;
  id?: string;
  /** Lets a tab ignore the echo of its own write. */
  origin: string;
}

type Listener = (event: SyncEvent) => void;

const listeners = new Set<Listener>();

/** Identifies this tab, so we can skip our own BroadcastChannel echoes. */
const TAB_ID = Math.random().toString(36).slice(2);

let channel: BroadcastChannel | null = null;
let started = false;

function ensureStarted() {
  if (started || typeof window === "undefined") return;
  started = true;

  if ("BroadcastChannel" in window) {
    channel = new BroadcastChannel(SYNC_CHANNEL);
    channel.onmessage = (event: MessageEvent<SyncEvent>) => {
      if (event.data?.origin === TAB_ID) return;
      emitLocal(event.data);
    };
  }

  /*
    The storage event is the fallback for browsers without BroadcastChannel,
    and a safety net if a write happens outside our adapter. It only fires in
    OTHER tabs, so there is no echo to filter.
  */
  window.addEventListener("storage", (event) => {
    if (!event.key) return;
    const collection = COLLECTION_BY_KEY.get(event.key);
    if (!collection) return;
    emitLocal({ collection, action: "update", origin: "storage" });
  });
}

/** Reverse lookup from storage key back to collection name. */
const COLLECTION_BY_KEY = new Map<string, CollectionName>();

export function registerCollectionKeys(collections: readonly CollectionName[]) {
  for (const name of collections) COLLECTION_BY_KEY.set(collectionKey(name), name);
}

function emitLocal(event: SyncEvent) {
  for (const listener of listeners) listener(event);
}

/** Announce a write to this tab's listeners and to every other open tab. */
export function publish(
  collection: CollectionName,
  action: SyncAction,
  id?: string,
): void {
  if (typeof window === "undefined") return;
  ensureStarted();
  const event: SyncEvent = { collection, action, id, origin: TAB_ID };
  emitLocal(event);
  channel?.postMessage(event);
}

/**
 * Subscribe to writes. Returns an unsubscribe function.
 * Pass `collections` to be called only for those collections.
 */
export function subscribe(
  listener: Listener,
  collections?: readonly CollectionName[],
): () => void {
  ensureStarted();
  const wrapped: Listener = collections
    ? (event) => {
        if (collections.includes(event.collection)) listener(event);
      }
    : listener;

  listeners.add(wrapped);
  return () => {
    listeners.delete(wrapped);
  };
}
