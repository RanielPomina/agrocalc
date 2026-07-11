import AsyncStorage from '@react-native-async-storage/async-storage';

export type LocalCollection =
  | 'agrocalcHistory'
  | 'agroLog'
  | 'stockLedger'
  | 'savedAudio'
  | 'outbox'
  | 'notices'
  | 'recipes'
  | 'chatMessages'
  | 'tasks';

export type LocalDocKey = 'session' | 'climateCache' | 'planState' | 'themeMode' | 'crashLog';

const namespace = 'agrosafra:v1';

const collectionKey = (collection: LocalCollection) => `${namespace}:list:${collection}`;
const docKey = (doc: LocalDocKey) => `${namespace}:doc:${doc}`;

export async function readCollection<T>(collection: LocalCollection): Promise<T[]> {
  const raw = await AsyncStorage.getItem(collectionKey(collection));
  return raw ? (JSON.parse(raw) as T[]) : [];
}

export async function writeCollection<T>(collection: LocalCollection, records: T[]): Promise<void> {
  await AsyncStorage.setItem(collectionKey(collection), JSON.stringify(records));
}

export async function appendRecord<T extends { id: string }>(
  collection: LocalCollection,
  record: T,
): Promise<void> {
  const records = await readCollection<T>(collection);
  await writeCollection(collection, [record, ...records]);
}

export async function removeRecord(collection: LocalCollection, id: string): Promise<void> {
  const records = await readCollection<{ id: string }>(collection);
  await writeCollection(
    collection,
    records.filter((record) => record.id !== id),
  );
}

export async function updateRecord<T extends { id: string }>(
  collection: LocalCollection,
  id: string,
  patch: Partial<T>,
): Promise<void> {
  const records = await readCollection<T>(collection);
  const next = records.map((record) => (record.id === id ? { ...record, ...patch } : record));
  await writeCollection(collection, next);
}

export async function readDoc<T>(doc: LocalDocKey): Promise<T | null> {
  const raw = await AsyncStorage.getItem(docKey(doc));
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function writeDoc<T>(doc: LocalDocKey, value: T): Promise<void> {
  await AsyncStorage.setItem(docKey(doc), JSON.stringify(value));
}

export async function clearDoc(doc: LocalDocKey): Promise<void> {
  await AsyncStorage.removeItem(docKey(doc));
}