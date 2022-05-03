class StorageError extends Error {};

type MaybePromise<T> = T | Promise<T>;

export type StorageImplementation = {
    clear(): MaybePromise<void>;
    getItem(key: string): MaybePromise<string | null>;
    removeItem(key: string): MaybePromise<void>;
    setItem(key: string, value: string): MaybePromise<void>;
    multiGet?(keys: string[]): Promise<[string, string][]>;
    length: number,
} & Record<string, string>

// interface StorageImplementation {
//     getItem(K: string): string | null | Promise<string | null>
//     setItem(K: string, V: string): void | Promise<void>
//     removeItem(key: string): void | Promise<void>;
//     clear(): void | Promise<void>;
//     length: number
// }

type JsonStringifyable = (
    null | number | string | boolean |
    JsonStringifyable[] | { [k:string]: JsonStringifyable }
)

export class AppStorage {

    version = "%VERSION%";
    readonly storage: StorageImplementation;
    readonly prefix?: string

    /**
     * Same as storage.rm();
     */
    remove: AppStorage['rm'];

    /** Same as storage.clear() */
    reset: AppStorage['clear'];

    constructor(storage: StorageImplementation, prefix?: string) {

        this.storage = storage;
        this.prefix = prefix

        this.remove = this.rm;
        this.reset = this.clear;
    }

    /**
     * Returns an object of all keys
     */
    async get <T extends JsonStringifyable = JsonStringifyable>(): Promise<T extends object ? T : Record<string, T>>

    /**
     * Returns a single value from storage
     * @param key key to find
     */
    async get <T extends JsonStringifyable = JsonStringifyable>(key: string): Promise<T>

    /**
     * Returns an object of the keys passed
     * @param keys keys to find
     */
    async get <T extends JsonStringifyable = JsonStringifyable>(keys: string[]): Promise<T extends object ? T : Record<string, T>>

    async get (keyOrKeys?: any) {

        if (keyOrKeys === undefined) {

            return this.get(this._allKeys())
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
    async set(values: object): Promise<void>

    /**
     * Sets a key to given value into storage
     * @param key
     * @param value
     */
    async set(key: string, value: any): Promise<void>

    async set(key: any, value?: any) {

        this._assertKey(key);

        if (typeof key === 'object') {

            await Promise.all(
                Object.entries(key).map(
                    ([key, val]) => (
                        this.set(key, val)
                    )
                )
            );

            return;
        }

        return this.storage.setItem(
            this._key(key),
            JSON.stringify(value)
        );
    }

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
    async rm(key: string): Promise<void>

    /**
     * Removes the given array of keys
     * @param keys
     */
    async rm(keys: string[]): Promise<void>

    async rm(keyOrKeys: any) {

        this._assertKey(keyOrKeys[0]);

        if (Array.isArray(keyOrKeys)) {

            await Promise.all(
                keyOrKeys.map(
                    key => this.rm(key)
                )
            );

            return
        }

        return this.storage.removeItem(
            this._key(keyOrKeys)
        );
    }


    /**
     * Returns an array of boolean values denoting
     * whether the keys exist within the storage or not
     * @param keys
     */
    has(keys: string[]): Promise<boolean[]>

    /**
     * Returns whether key exists within the storage
     * @param key
     */
    has(key: string): Promise<boolean>


    async has(keyOrKeys: any): Promise<unknown> {

        this._assertKey(keyOrKeys[0]);

        // Handle async storage
        if (!!this.storage.multiGet) {

            let keys = [keyOrKeys];

            if (Array.isArray(keyOrKeys)) {

                keys = keyOrKeys;
            }

            keys = keys.map(k => this._key(k));

            const values = (

                await this.storage.multiGet(keys)
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
     * Returns all keys scoped by prefix
     */
    clear(): Promise<void> {

        return this.rm(
            this._allKeys()
        );
    }

    /**
     * Returns all keys scoped by prefix
     */
    keys(): string[] {

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

    get length() {

        return this._allKeys().length;
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

    private _allKeys() {

        let keys = Object.keys(this.storage);

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