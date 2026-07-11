import AsyncStorage from '@react-native-async-storage/async-storage';

export type LocalCollection = 'agrocalcHistory' | 'agroLog' | 'stockLedger' | 'savedAudio' | 'outbox';

const namespace = 'agrosafra:v1';

const keyFor = (collection: LocalCollection) => `${namespace}:${collection}`;

export async function readCollection<T>(collection: LocalCollection): Promise<T[]> {
  const raw = await AsyncStorage.getItem(keyFor(collection));
  return raw ? (JSON.parse(raw) as T[]) : [];
}

export async function writeCollection<T>(collection: LocalCollection, records: T[]): Promise<void> {
  await AsyncStorage.setItem(keyFor(collection), JSON.stringify(records));
}

export async function appendRecord<T extends { id: string }>(collection: LocalCollection, record: T): Promise<void> {
  const records = await readCollection<T>(collection);
  await writeCollection(collection, [record, ...records]);
}