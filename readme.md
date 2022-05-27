# Easy App Storage

Simplified API for working with Local Storage, Session Storage or Async Storage. Stores anything that is `JSON.stringify`-able. This can be scoped to only a particular prefix so as to not interfere with other code that might be using the storage implementation. You can optionally hook into sets and deletes.

- [Easy App Storage](#easy-app-storage)
  - [Example](#example)
  - [Extend typings](#extend-typings)
  - [AppStorage options](#appstorage-options)
  - [`get(keyOrKeys?: string | string[])`](#getkeyorkeys-string--string)
  - [`set(keyOrObject: string | object, value?: any)`](#setkeyorobject-string--object-value-any)
  - [`remove(keyOrKeys: string | string[])` or `rm(...)`](#removekeyorkeys-string--string-or-rm)
  - [`has(keyOrKeys: string | string[])`](#haskeyorkeys-string--string)
  - [`clear()` or `reset()`](#clear-or-reset)
  - [`keys()`](#keys)
  - [`entries()`](#entries)
  - [`values()`](#values)

## Example

```ts

// Pass the storage API that you will use
// All keys will be prefixed with `hey:[key]`
const local = new AppStorage(localStorage, 'hey');

// With hooks
const local = new AppStorage(localStorage, {

    prefix: 'hey',
    onBeforeSet(keyOrObject: string | object, value?: any) {

        if (typeof keyOrObject === 'object') {

            events.emit('storage-changed', keyOrObject);
            return;
        }

        events.emit('storage-changed', { [keyOrObject]: value });
    },
    onBeforeRemove(keyOrKeys: string | string[]) {

        if (Array.isArray(keyOrKeys)) {

            events.emit('storage-removed', keyOrKeys);
            return;
        }

        events.emit('storage-removed', [keyOrKeys]);
    }
});


const theFruits = {
    apples: 5,
    bananas: 10,
    oranges: 12
};

// Save an object
await local.set('fruits', theFruits);

// You can fetch an object and pass the type
// that you expect to get back from it
const savedFruits = await local.get <typeof theFruits>('fruits');

// Object.assign the existing object
await local.assign('fruits', {
    peaches: 5,
    dragonFruit: 15
});

// Set an entire object and its keys will be
// saved as part of the store
await local.set({
    many: true,
    different: 'keys',
    can: 'be set',
    when: ['you', 'pass', 'an', 'object']
});

await local.get('many')
// > true

await local.get('different')
// > 'keys'

await local.get('can')
// > 'be set'

await local.get('when')
// > ['you', 'pass', 'an', 'object']

// Remove a keyor many keys
await local.rm('when');
await local.rm(['can', 'when']);

// Check if a key exists
await local.has('when'); // false

// Similar API to an object
const keys = await local.keys();
const values = await local.values();
const entries = await local.entries();

```

## Extend typings

You can extend the typings used to identify keys and the shape of the data they will have by extending the interface `StoredAppValues`

```tsx
import {
    AppStorageKeys,
    AppStorageValues
} from 'easy-app-storage'

type Auth = {
    bearer_token: string,
    refresh_token: string
};

type Themes = 'dark' | 'light';

declare module 'easy-app-storage' {

    export interface StoredAppValues {

        auth: Auth | null;
        theme: Theme;
        showHelp: boolean;
    }
}

const themeSwitcher = (theme: Themes) => {

    // this will scream if the value is incorrect
    await storage.set('theme', theme);
}

// this will accurately retrieve the auth type
const auth = await storage.get('auth');

```

## AppStorage options

```ts

interface onSet {

    <K extends Keys>(key: K, value: Shapes<K>): Void;
    (value: StoredAppValues & Record<string, JsonStringifyable>): Void;
}

interface onRemove {

    (key: Keys): Void;
    (key: Keys[]): Void;
}


interface AppStorageOptions {

    prefix?: string
    onBeforeSet?: onSet
    onAfterSet?: onSet
    onBeforeRemove?: onRemove
    onAfterRemove?: onRemove
}

interface AppStorage {

    constructor(storage: StorageImplementation, prefixOrOptions?: string | AppStorageOptions)

    // ...etc
}

```


## `get(keyOrKeys?: string | string[])`

```ts

/**
 * Returns an object of all keys
 */
async get <T = StoredAppValues>(): Promise<T>

/**
 * Returns a single value from storage
 * @param key key to find
 */
async get <K extends Keys>(key: K): Promise<Shapes<K>>
async get <T = JsonStringifyable>(key: string): Promise<T>

/**
 * Returns an object of the keys passed
 * @param keys keys to find
 */
async get <
    K1 extends Keys,
    K2 extends Keys,
    // ...etc
>(keys: [K1, K2]): Promise<
    Record<K1, Shapes<K1>> &
    Record<K2, Shapes<K2>>
    // ...etc
>

/**
 * Or maybe you don't care about being typed and want to return anything.
 * You can always define the return type.
 * @param keys keys to find
 */
async get <T = Record<string, JsonStringifyable>>(keys: string[]): Promise<T>


```

- `get()` returns the entire storage
- `get('key')` returns the value of that particular key
- `get(['key1', 'key2'])` returns an object of `{ key: value }`

## `set(keyOrObject: string | object, value?: any)`

```ts
/**
 * Saves entire object by `{ key: value }`
 * @param values object to save to storage
 */
async set(values: Partial<StoredAppValues> & Record<string, any>): Promise<void>

/**
 * Sets a key to given value into storage
 * @param key
 * @param value
 */
async set <K extends Keys>(key: K, value: Shapes<K>): Promise<void>
async set <K extends Keys | string>(key: K, value: Shapes<K>): Promise<void>

```

```ts
/**
 * `Object.assign()` given value to given key
 * @param key key to merge
 * @param val value to merge
 */

async assign <K extends Keys>(key: K, val: Partial<Shapes<K>>): Promise<void>
async assign <K extends Keys | string>(key: K, val: Partial<Shapes<K>>): Promise<void>
```

## `remove(keyOrKeys: string | string[])` or `rm(...)`

```ts
/**
 * Removes a single key
 * @param key
 */
async remove <K extends Keys>(key: K): Promise<void>
async remove(key: string): Promise<void>

/**
 * Removes the given array of keys
 * @param keys
 */
async remove(key: Keys[]): Promise<void>
async remove(keys: string[]): Promise<void>
```

## `has(keyOrKeys: string | string[])`

```ts
/**
 * Returns an array of boolean values denoting
 * whether the keys exist within the storage or not
 * @param keys
 */
has(keys: Keys[]): Promise<boolean[]>
has(keys: string[]): Promise<boolean[]>

/**
 * Returns whether key exists within the storage
 * @param key
 */
has(keys: Keys): Promise<boolean>
has(key: string): Promise<boolean>
```

## `clear()` or `reset()`

```ts
/**
 * Removes all prefixed values from the storage
 */
clear(): Promise<void>;
```

## `keys()`

```ts
/**
 * Returns all keys scoped by prefix
 */
keys(): Promise<string[]>;
```

## `entries()`

```ts
/**
 * `Object.entries()` against the entire store as an object
 */
entries(): Promise<[string, JsonStringifyable][]>;
```

## `values()`

```ts
/**
 * `Object.values()` against the entire store as an object
 */
values(): Promise<JsonStringifyable[]>;
```
