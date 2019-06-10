import { version } from '../package.json';

/**
 * Instantiates BWS object which gives you access to
 * localStorage or sessionStorage in a way that handles
 * objects and prefixes keys for non-clashing behavior
 */
export default class BetterWebStorage {

    /**
     * Returns current version of BWS
     */
    get version() {
        return version;
    }

    /**
     * Creates a new BWS instance
     * @param {object} opts Pass `session|local = true` and optionally `prefix = 'myApp'`
     */
    constructor (opts) {

        const {
            local,
            session,
            prefix
        } = opts;

        if (!local && !session) {
            throw Error('local or session option is required.');
        }

        if (local && session) {
            throw Error('must select either local or session, not both.');
        }

        if (prefix) {

            this.prefix = prefix;
        }

        if (local) {

            this._storage = (window || global).localStorage;
        }

        if (session) {

            this._storage = (window || global).sessionStorage;
        }

        if (!this._storage) {

            throw Error(`storage method does not exist.`);
        }
    }

    /**
     * Generates a key based on prefix
     * @param {string} key key to prefix
     */
    key(key) {

        if (this.prefix) {

            return [this.prefix, key].join('_');
        }

        return key
    }

    /**
     * Retrieves only prefixed keys
     */
    filterPrefixedKeys() {

        const rgx = new RegExp('^'+this.key(''));

        return Object.keys(this._storage)
            .filter((k) => rgx.test(k))
    }

    /**
     * Strips the prefix from keys
     * @param {array} arr Array of prefixed keys
     */
    strippedPrefix(arr) {

        const pre = this.key('');
        return arr.map((k) => k.replace(pre, ''));
    }

    /**
     * Saves a stringified value in localStorage as prefixed key
     * @param {string} key Key without prefix
     * @param {any} val Value to JSON encode
     */
    set(key, val) {

        if (!key) {

            throw Error('key is required');
        }

        if (key.constructor === Object) {

            Object.keys(key).forEach((k) => {
                this.set(k, key[k]);
            });

            return;
        }

        return this._storage.setItem(this.key(key), JSON.stringify(val));
    }

    /**
     * Gets local storage key using prefix
     * @param {string} key Key without prefix
     */
    get(key) {

        if (!key) {

            throw Error('key is required');
        }


        if (arguments.length > 1) {

            return Array.from(arguments)
                .map((k) => [k, this.get(k)])
                .reduce((a, [k, val]) => {
                    a[k] = val
                    return a;
                }, {});
        }

        const val = this._storage.getItem(this.key(key));

        if (!val) {
            return val;
        }

        return JSON.parse(val);
    }

    /**
     * Checks if key exists
     * @param {string} key Key without prefix
     */
    has(key) {

        if (!key) {

            throw Error('key is required');
        }

        if (arguments.length > 1) {

            return Array.from(arguments)
                .map((k) => this.has(k))
                .indexOf(false) === -1;
        }

        return this._storage.hasOwnProperty(this.key(key));
    }

    /**
     * Removes key from localStorage
     * @param {string} key Key without prefix
     */
    rmv(key) {

        if (!key) {

            throw Error('key is required');
        }

        if (arguments.length > 1) {

            return Array.from(arguments).forEach(k => this.rmv(k));
        }

        return this._storage.removeItem(this.key(key));
    }

    /** Clears all prefixed keys */
    clear() {

        if (this.prefix) {

            const all = this.strippedPrefix(this.filterPrefixedKeys());
            return this.rmv(...all);
        }

        this._storage.clear();
    }

    /** Counts all prefixed keys */
    get length () {

        if (this.prefix) {

            return this.filterPrefixedKeys().length
        }

        return this._storage.length;
    }

    /** Returns array of keys without prefix */
    get all() {

        let all = this.filterPrefixedKeys();

        if (this.prefix) {

            all = this.strippedPrefix(all);
        }

        return this.get(...all)
    }

    /**
     * Assigns `val` to current key value. Both values must be an object.
     * @param {string} key Key without prefix
     * @param {object} val Object to assign to value
     */
    assign(key, val) {

        const current = this.get(key);

        if (val.constructor !== Object) {

            throw Error('value must be an object');
        }

        if (current.constructor !== Object) {

            throw Error('item is not an object');
        }

        Object.assign(current, val);

        this.set(key, current);
    }

    /**
     * Iterates through keys
     * @param {function} fn Function to iterate over eg: (key, val) => {}
     */
    each(fn) {

        if (fn.constructor !== Function) {

            throw Error('argument is not a function');
        }

        Object.entries(this.all).forEach((v) => fn(...v));
    }

    /**
     * Maps through keys
     * @param {function} fn Function to iterate over eg: (key, val) => {}
     */
    map(fn) {

        if (fn.constructor !== Function) {

            throw Error('argument is not a function');
        }

        return Object.entries(this.all).map((v) => fn(...v));
    }
}
