import { version } from '../package.json';

class AppStorageError extends Error {};

interface StorageImplementation {
    getItem(K: string): string | null | Promise<string | null>
    setItem(K: string, V: string): void | Promise<void>
    removeItem(key: string): void | Promise<void>;
    clear(): void | Promise<void>;
    length: number
}

type JsonStringifyable = (
    object | string | boolean |
    null | JsonStringifyable[] | number |
    { [K: string]: JsonStringifyable }
)

export class AppStorage {

    version = version;
    readonly storage: StorageImplementation;
    readonly prefix?: string

    /**
     * Same as storage.rm();
     */
    remove: AppStorage['rm'];

    constructor(storage: StorageImplementation, prefix?: string) {

        this.storage = storage;
        this.prefix = prefix

        this.remove = this.rm;
    }

    async get <T extends JsonStringifyable = JsonStringifyable>(keyOrKeys?: string | string[]): Promise<T> {

        if (keyOrKeys === undefined) {

            return this.get(this._allKeys())
        }


        if (Array.isArray(keyOrKeys)) {

            const entries: [string, JsonStringifyable][] = [];

            for (const key of keyOrKeys) {
                entries.push([key, await this.get(key)]);
            }

            return Object.fromEntries(entries) as T;
        }

        return JSON.parse(
            await this.storage.getItem(
                this._key(keyOrKeys)
            ) || 'null'
        );
    }

    async set(key: string | object, value: any) {

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

    async assign <T extends object>(key: string, val: T) {

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

    async rm(keyOrKeys: string | string[]): Promise<void> {

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

    has(keyOrKeys: string | string[]): boolean | boolean[] {

        this._assertKey(keyOrKeys[0]);

        if (Array.isArray(keyOrKeys)) {

            return keyOrKeys.map(
                k => this.storage.hasOwnProperty(k)
            )
        }

        return this.storage.hasOwnProperty(keyOrKeys);
    }

    clear() {

        return this.rm(
            this._allKeys()
        );
    }

    keys() {

        return this._allKeys();
    }

    async entries() {

        const all = await this.get();

        return Object.entries(all!);
    }

    async values () {

        const all = await this.get();

        return Object.values(all!);
    }

    get length() {

        if (this.prefix) {

            return this._allKeys().length
        }

        return this.storage.length;
    }


    private throw (msg: string) {

        throw new AppStorageError(msg);
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