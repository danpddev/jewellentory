import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRandomValues } from 'expo-crypto';

const storageKey = 'pricemerald-quotation-folio';
let pending: Promise<unknown> = Promise.resolve();

type Series = { prefix: string; lastNumber: number };

async function advanceSeries(): Promise<string> {
  const stored = await AsyncStorage.getItem(storageKey);
  const series: Series = stored ? JSON.parse(stored) : {
    prefix: Array.from(getRandomValues(new Uint8Array(8)), (byte) =>
      byte.toString(16).padStart(2, '0'),
    ).join('').toUpperCase(),
    lastNumber: 0,
  };
  const next = { ...series, lastNumber: series.lastNumber + 1 };
  await AsyncStorage.setItem(storageKey, JSON.stringify(next));
  return `TAM-${next.prefix}-${String(next.lastNumber).padStart(5, '0')}`;
}

export function reserveQuotationFolio(): Promise<string> {
  const run = () => {
    const locks = typeof navigator === 'undefined' ? undefined : navigator.locks;
    return locks ? locks.request(storageKey, advanceSeries) : advanceSeries();
  };
  const result = pending.then(run);
  pending = result.catch(() => undefined);
  return result;
}
