import type * as t from '../types';

export class StorageService {
  private storage: Storage;
  private savedValues: t.savedValues;

  constructor(defaultValues: t.savedValues) {
    if (typeof localStorage === 'undefined') {
      this.storage = {
        storage: new Map(),
        getItem(key: string) {
          return this.storage.get(key) || null;
        },
        setItem(key: string, value: string) {
          this.storage.set(key, value);
        },
        removeItem(key: string) {
          this.storage.delete(key);
        },
        clear() {
          this.storage.clear();
        },
        key(index: number) {
          const keys: string[] = Array.from(this.storage.keys());
          return keys[index] || null;
        },
        get length() {
          return this.storage.size;
        },
      };
    } else {
      this.storage = localStorage;
    }

    this.savedValues = defaultValues;
  }

  select<K extends t.savedKeys>(key: K): t.savedValues[K] {
    let savedValue = this.storage.getItem(key);
    if (savedValue && !savedValue.startsWith('{')) {
      this.storage.removeItem(key);
      savedValue = null;
    }
    if (savedValue === null) {
      savedValue = JSON.stringify({ data: this.savedValues[key] });
      this.storage.setItem(key, savedValue);
    }
    return JSON.parse(savedValue).data;
  }

  insert<K extends t.savedKeys>(key: K, value: t.savedValues[K]): void {
    const savedValue = JSON.stringify({ data: value });
    this.storage.setItem(key, savedValue);
  }

  selectAll(): t.savedValues {
    const keys = <t.savedKeys[]>Object.keys(this.savedValues);
    const allItems = keys.reduce((acc: Record<string, unknown>, key) => {
      const savedValue = this.select(key);
      acc[key] = savedValue;
      return acc;
    }, {});
    return <t.savedValues>allItems;
  }
}
