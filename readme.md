# Easy App Storage

Simplified API for working with Local Storage, Session Storage or Async Storage. Stores anything that is `JSON.stringify`-able. This can be scoped to only a particular prefix so as to not interfere with other libraries.

> NOTE: You can scope your keys to a given prefix and only ever
> manipulate that prefix.

## Example

```ts

// Pass the storage API that you will use
// All keys will be prefixed with `hey:[key]`
const local = new AppStorage(localStorage, 'hey');

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
const keys = local.keys();
const values = await local.values();
const entries = await local.entries();

```

## remove

```ts
remove(): AppStorage['rm'];
```

## get

```ts
get<T>(): Promise<T extends object ? T : Record<string, T>>;
get<T>(key: string): Promise<T>;
get<T>(keys: string[]): Promise<T extends object ? T : Record<string, T>>;
```

- `get()` returns the entire storage
- `get('key')` returns the value of that particular key
- `get(['key1', 'key2'])` returns an object of `{ key: value }`

## set

```ts
set(values: object): Promise<void>;
set(key: string, value: any): Promise<void>;
```

```ts
assign<T extends object>(key: string, val: T): Promise<void>;
```

## rm|remove

```ts
rm(key: string): Promise<void>;
rm(keys: string[]): Promise<void>;
```

## has

```ts
has(keys: string[]): Promise<boolean[]>;
has(key: string): Promise<boolean>;
```

## clear|reset

```ts
clear(): Promise<void>;
```

## keys

```ts
keys(): string[];
```

## entries

```ts
entries(): Promise<[string, JsonStringifyable][]>;
```

## values

```ts
values(): Promise<JsonStringifyable[]>;
```

## length

```ts
length: number;
```
