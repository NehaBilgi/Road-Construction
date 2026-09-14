import { supabase, isSupabaseConfigured } from '../supabaseClient';

/**
 * Shared persistence for the app's existing localStorage-based modules.
 *
 * Keeping this adapter at the storage boundary means all existing modules
 * continue to work without duplicating their state-management code. The
 * browser remains usable offline; writes are queued in memory and retried
 * when the next write happens or the page is reopened.
 */
const STORAGE_TABLE = 'app_storage';
const PENDING_KEYS_STORAGE = 'CONSTRUCTION_PRO_CLOUD_PENDING_KEYS';
const pendingWrites = new Map<string, number>();
let installed = false;

// The old login is a client-only demo login. Never upload its password list or
// the current browser's login marker to a public Supabase table.
const isPrivateBrowserKey = (key: string) =>
  key.includes('_USER_ACCOUNTS') ||
  key.endsWith('_USER') ||
  key.endsWith('_AUTH') ||
  key.startsWith('CONSTRUCTION_PRO_DATA_VERSION') ||
  key.startsWith('CONSTRUCTION_PRO_CLOUD_PENDING') ||
  key === 'CONSTRUCTION_PRO_THEME';

const isSyncableKey = (key: string) =>
  !isPrivateBrowserKey(key) && !key.startsWith('SUPABASE_');

const parseStoredValue = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const getSyncableLocalEntries = () => {
  const entries: Array<{ storage_key: string; value: unknown }> = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key || !isSyncableKey(key)) continue;
    const value = window.localStorage.getItem(key);
    if (value !== null) {
      entries.push({ storage_key: key, value: parseStoredValue(value) });
    }
  }
  return entries;
};

const getPendingKeys = (): string[] => {
  const raw = window.localStorage.getItem(PENDING_KEYS_STORAGE);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((key) => typeof key === 'string') : [];
  } catch {
    return [];
  }
};

const setPending = (key: string, pending: boolean) => {
  const keys = new Set(getPendingKeys());
  if (pending) keys.add(key);
  else keys.delete(key);
  window.localStorage.setItem(PENDING_KEYS_STORAGE, JSON.stringify([...keys]));
};

const saveKey = async (key: string, value: string | null): Promise<boolean> => {
  if (!supabase || !isSyncableKey(key)) return false;

  if (value === null) {
    const { error } = await supabase
      .from(STORAGE_TABLE)
      .delete()
      .eq('storage_key', key);
    if (error) {
      console.error(`Supabase delete failed for ${key}`, error);
      return false;
    }
    setPending(key, false);
    return true;
  }

  const { error } = await supabase.from(STORAGE_TABLE).upsert(
    {
      storage_key: key,
      value: parseStoredValue(value),
      updated_at: new Date().toISOString()
    },
    { onConflict: 'storage_key' }
  );
  if (error) {
    console.error(`Supabase save failed for ${key}`, error);
    return false;
  }
  setPending(key, false);
  return true;
};

const scheduleSave = (key: string, value: string | null) => {
  if (!isSyncableKey(key)) return;
  setPending(key, true);
  const previous = pendingWrites.get(key);
  if (previous) window.clearTimeout(previous);

  const timer = window.setTimeout(() => {
    pendingWrites.delete(key);
    void saveKey(key, value);
  }, 350);

  pendingWrites.set(key, timer);
};

const retryPendingWrites = async () => {
  if (!supabase) return;
  for (const key of getPendingKeys()) {
    await saveKey(key, window.localStorage.getItem(key));
  }
};

/**
 * Loads the shared data before React mounts. If the Supabase table is empty,
 * the current browser becomes the initial migration source exactly once.
 */
export const hydrateLocalStorageFromCloud = async (): Promise<'cloud' | 'local' | 'disabled'> => {
  if (!isSupabaseConfigured || !supabase) return 'disabled';

  const pendingValues = new Map(
    getPendingKeys().map((key) => [key, window.localStorage.getItem(key)])
  );

  const { data, error } = await supabase
    .from(STORAGE_TABLE)
    .select('storage_key,value')
    .order('storage_key');

  if (error) {
    console.error('Supabase hydration failed; using local browser data', error);
    return 'local';
  }

  if (!data || data.length === 0) {
    const localEntries = getSyncableLocalEntries();
    if (localEntries.length > 0) {
      const { error: migrationError } = await supabase
        .from(STORAGE_TABLE)
        .upsert(
          localEntries.map((entry) => ({
            ...entry,
            updated_at: new Date().toISOString()
          })),
          { onConflict: 'storage_key' }
        );
      if (migrationError) {
        console.error('Initial local data migration failed', migrationError);
        return 'local';
      }
      for (const key of pendingValues.keys()) setPending(key, false);
      return 'cloud';
    }
    return 'local';
  }

  const cloudKeys = new Set<string>();
  for (const row of data) {
    if (!row.storage_key || !isSyncableKey(row.storage_key)) continue;
    cloudKeys.add(row.storage_key);
    window.localStorage.setItem(row.storage_key, JSON.stringify(row.value));
  }

  // Remove stale records from this browser so a first load cannot combine
  // unrelated local data with the canonical shared workspace.
  for (const entry of getSyncableLocalEntries()) {
    if (!cloudKeys.has(entry.storage_key)) {
      window.localStorage.removeItem(entry.storage_key);
    }
  }

  // A failed/offline write wins over the older cloud value on the next boot.
  // This prevents an offline form submission from being overwritten during
  // hydration before it has had a chance to retry.
  for (const [key, value] of pendingValues) {
    await saveKey(key, value);
  }

  return 'cloud';
};

/**
 * Mirrors future writes made by the existing modules to Supabase.
 */
export const installCloudStorageSync = () => {
  if (installed || !isSupabaseConfigured || !supabase) return;
  installed = true;

  const storagePrototype = Storage.prototype;
  const originalSetItem = storagePrototype.setItem;
  const originalRemoveItem = storagePrototype.removeItem;
  const originalClear = storagePrototype.clear;

  storagePrototype.setItem = function setItem(key: string, value: string) {
    originalSetItem.call(this, key, value);
    if (this === window.localStorage) scheduleSave(key, value);
  };

  storagePrototype.removeItem = function removeItem(key: string) {
    originalRemoveItem.call(this, key);
    if (this === window.localStorage) scheduleSave(key, null);
  };

  storagePrototype.clear = function clear() {
    const keys = getSyncableLocalEntries().map((entry) => entry.storage_key);
    originalClear.call(this);
    if (this === window.localStorage) {
      for (const key of keys) scheduleSave(key, null);
    }
  };

  window.addEventListener('online', () => {
    void retryPendingWrites();
  });
  void retryPendingWrites();
};
