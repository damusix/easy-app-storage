class StorageError extends Error {};

type MaybePromise<T> = T | Promise<T>;

export type StorageImplementation = {
    clear(): MaybePromise<void>;
    getItem(key: string, callback?: any): MaybePromise<string | null>;
    removeItem(key: string): MaybePromise<void>;
    setItem(key: string, value: string): MaybePromise<void>;
    multiGet?(keys: string[]): Promise<readonly [string, string | null][]>;
    getAllKeys?(callback?: any): Promise<readonly string[]>;
};

type JsonStringifyable = (
    null | number | string | boolean |
    JsonStringifyable[] | { [k:string]: JsonStringifyable }
)

/**
 * Extendible interface to document what keys exist, and
 * the possible shape they take
 */
export interface StoredAppValues {}

type Keys = keyof StoredAppValues;
type Shapes<K> = K extends keyof StoredAppValues ? StoredAppValues[K] : any;

export type AppStorageKeys = Keys;
export type AppStorageShapes<K> = Shapes<K>;


type Void = void | Promise<void>;

interface onSet {

    <K extends Keys>(key: K, value: Shapes<K>): Void;
    <K extends Keys | string>(key: K, value: Shapes<K>): Void;
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

const maybeCall = (fn: Function | null, args?: any[]) => {

    if (fn) {

        fn.apply(fn, args);
    }
}

export class AppStorage {

    version = "%VERSION%";
    readonly storage: StorageImplementation;
    readonly prefix?: string

    private onBeforeSet!: onSet | null
    private onAfterSet!: onSet | null
    private onBeforeRemove!: onRemove | null
    private onAfterRemove!: onRemove | null

    private isReactNative: boolean = false;

    /**
     * Same as storage.rm();
     */
    remove: AppStorage['rm'];

    /** Same as storage.clear() */
    reset: AppStorage['clear'];

    constructor(storage: StorageImplementation, prefixOrOptions?: string | AppStorageOptions) {

        this.storage = storage;

        if (typeof prefixOrOptions === 'string') {

            this.prefix = prefixOrOptions
        }

        if (typeof prefixOrOptions === 'object') {

            this.prefix = prefixOrOptions.prefix;
            this.onBeforeSet = prefixOrOptions.onBeforeSet || null;
            this.onAfterSet = prefixOrOptions.onAfterSet || null;
            this.onBeforeRemove = prefixOrOptions.onBeforeRemove || null;
            this.onAfterRemove = prefixOrOptions.onAfterRemove || null;
        }

        if (!!storage.multiGet) {

            this.isReactNative = true;
        }

        this.remove = this.rm;
        this.reset = this.clear;
    }

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

    async get <
        K1 extends Keys,
        K2 extends Keys,
    >(keys: [K1, K2]): Promise<
        Record<K1, Shapes<K1>> &
        Record<K2, Shapes<K2>>
    >

    async get <
        K1 extends Keys,
        K2 extends Keys,
        K3 extends Keys,
    >(keys: [K1, K2, K3]): Promise<
        Record<K1, Shapes<K1>> &
        Record<K2, Shapes<K2>> &
        Record<K3, Shapes<K3>>
    >

    async get <
        K1 extends Keys,
        K2 extends Keys,
        K3 extends Keys,
        K4 extends Keys,
    >(keys: [K1, K2, K3, K4]): Promise<
        Record<K1, Shapes<K1>> &
        Record<K2, Shapes<K2>> &
        Record<K3, Shapes<K3>> &
        Record<K4, Shapes<K4>>
    >

    async get <
        K1 extends Keys,
        K2 extends Keys,
        K3 extends Keys,
        K4 extends Keys,
        K5 extends Keys,
    >(keys: [K1, K2, K3, K4, K5]): Promise<
        Record<K1, Shapes<K1>> &
        Record<K2, Shapes<K2>> &
        Record<K3, Shapes<K3>> &
        Record<K4, Shapes<K4>> &
        Record<K5, Shapes<K5>>
    >

    async get <
        K1 extends Keys,
        K2 extends Keys,
        K3 extends Keys,
        K4 extends Keys,
        K5 extends Keys,
        K6 extends Keys,
    >(keys: [K1, K2, K3, K4, K5, K6]): Promise<
        Record<K1, Shapes<K1>> &
        Record<K2, Shapes<K2>> &
        Record<K3, Shapes<K3>> &
        Record<K4, Shapes<K4>> &
        Record<K5, Shapes<K5>> &
        Record<K6, Shapes<K6>>
    >

    async get <
        K1 extends Keys,
        K2 extends Keys,
        K3 extends Keys,
        K4 extends Keys,
        K5 extends Keys,
        K6 extends Keys,
        K7 extends Keys,
    >(keys: [K1, K2, K3, K4, K5, K6, K7]): Promise<
        Record<K1, Shapes<K1>> &
        Record<K2, Shapes<K2>> &
        Record<K3, Shapes<K3>> &
        Record<K4, Shapes<K4>> &
        Record<K5, Shapes<K5>> &
        Record<K6, Shapes<K6>> &
        Record<K7, Shapes<K7>>
    >

    async get <
        K1 extends Keys,
        K2 extends Keys,
        K3 extends Keys,
        K4 extends Keys,
        K5 extends Keys,
        K6 extends Keys,
        K7 extends Keys,
        K8 extends Keys,
    >(keys: [K1, K2, K3, K4, K5, K6, K7, K8]): Promise<
        Record<K1, Shapes<K1>> &
        Record<K2, Shapes<K2>> &
        Record<K3, Shapes<K3>> &
        Record<K4, Shapes<K4>> &
        Record<K5, Shapes<K5>> &
        Record<K6, Shapes<K6>> &
        Record<K7, Shapes<K7>> &
        Record<K8, Shapes<K8>>
    >

    /**
     * Returns an object of the keys passed
     * @param keys keys to find
     */
    async get <T = Record<string, JsonStringifyable>>(keys: string[]): Promise<T>


    async get (keyOrKeys?: any) {

        if (keyOrKeys === undefined) {

            return this.get(await this._allKeys())
        }


        if (Array.isArray(keyOrKeys)) {

            const entries: [string, JsonStringifyable][] = [];

            for (const key of keyOrKeys) {
                entries.push([key, await this.get(key)]);
            }

            return Object.fromEntries(entries);
        }

        return JSON.parse(
            await this.storage.getItem(
                this._key(keyOrKeys)
            ) || 'null'
        );
    }

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

    async set(key: any, value?: any) {

        this._assertKey(key);

        if (typeof key === 'object') {

            maybeCall(this.onBeforeSet, [key]);

            await Promise.all(
                Object.entries(key).map(
                    async ([key, val]) => (
                        this.set(key, val)
                    )
                )
            );

            maybeCall(this.onAfterSet, [key]);

            return;
        }

        maybeCall(this.onBeforeSet, [key, value]);

        await this.storage.setItem(
            this._key(key),
            JSON.stringify(value)
        );

        maybeCall(this.onAfterSet, [key, value]);
    }


    async assign <K extends Keys>(key: K, val: Partial<Shapes<K>>): Promise<void>
    async assign <K extends Keys | string>(key: K, val: Partial<Shapes<K>>): Promise<void>
    /**
     * `Object.assign()` given value to given key
     * @param key key to merge
     * @param val value to merge
     */
    async assign <T extends object>(key: string, val: T): Promise<void> {

        const current = await this.get(key);

        if (!current) {

            this.throw('cannot assign to null value');
        }

        if (typeof current !== 'object') {

            this.throw(`key (${key}) value cannot be assigned (not an object)`);
        }


        if (typeof val !== 'object') {

            this.throw(`value (${val}) cannot be assigned (not an object)`);
        }

        Object.assign(current, val);

        return this.set(key, current);
    }

    /**
     * Removes a single key
     * @param key
     */
    async rm <K extends Keys>(key: K): Promise<void>
    async rm(key: string): Promise<void>

    /**
     * Removes the given array of keys
     * @param keys
     */
    async rm(key: Keys[]): Promise<void>
    async rm(keys: string[]): Promise<void>

    async rm(keyOrKeys: any) {

        this._assertKey(keyOrKeys[0]);

        maybeCall(this.onBeforeRemove, [keyOrKeys]);

        if (Array.isArray(keyOrKeys)) {

            await Promise.all(
                keyOrKeys.map(
                    key => this.rm(key)
                )
            );

            maybeCall(this.onAfterRemove, [keyOrKeys]);

            return
        }

        await this.storage.removeItem(
            this._key(keyOrKeys)
        );

        maybeCall(this.onAfterRemove, [keyOrKeys]);
    }


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


    async has(keyOrKeys: any): Promise<unknown> {

        this._assertKey(keyOrKeys[0]);

        // Handle async storage
        if (!!this.isReactNative) {

            let keys = [keyOrKeys];

            if (Array.isArray(keyOrKeys)) {

                keys = keyOrKeys;
            }

            keys = keys.map(k => this._key(k));

            const values = (

                await this.storage.multiGet!(keys)
            ).map(([key]) => key);

            const found = keys.map(key => values.indexOf(key) !== -1);

            if (found.length === 1) {

                return found.pop();
            }

            return found;
        }

        if (Array.isArray(keyOrKeys)) {

            return keyOrKeys.map(
                k => this.storage.hasOwnProperty(this._key(k))
            )
        }

        return this.storage.hasOwnProperty(this._key(keyOrKeys));
    }

    /**
     * Removes all prefixed values from the storage
     */
    async clear(): Promise<void> {

        await this.rm(
            await this._allKeys()
        );
    }

    /**
     * Returns all keys scoped by prefix
     */
    keys() {

        return this._allKeys();
    }

    /**
     * `Object.entries()` against the entire store as an object
     */
    async entries () {

        const all = await this.get();

        return Object.entries(all!);
    }

    /**
     * `Object.values()` against the entire store as an object
     */
    async values () {

        const all = await this.get();

        return Object.values(all!);
    }

    private throw (msg: string) {

        throw new StorageError(msg);
    }

    private _assertKey(key: string | object) {

        if (!key) {

            this.throw('key cannot be falsy');
        }
    }

    private _key(key: string) {

        if (this.prefix) {

            return `${this.prefix}:${key}`;
        }

        return key;
    }

    private async _allKeys() {

        let keys = Object.keys(this.storage);

        if (this.isReactNative) {

            keys = [...(await this.storage.getAllKeys!())];
        }

        if (this.prefix) {

            const rgx = new RegExp(`^${this.prefix}:`);

            return keys
                .filter(k => rgx.test(k))
                .map(k => k.replace(rgx, ''));
        }

        return keys;
    }
}

export default AppStorage;