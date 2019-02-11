import { version } from '../package.json';

export default class BetterWebStorage {

    get version() {
        return version;
    }

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

    key(key) {

        if (this.prefix) {

            return [this.prefix, key].join('_');
        }

        return key
    }

    filterPrefixedKeys() {

        const rgx = new RegExp('^'+this.key(''));

        return Object.keys(this._storage)
            .filter((k) => rgx.test(k))
    }

    strippedPrefix(arr) {

        const pre = this.key('');
        return arr.map((k) => k.replace(pre, ''));
    }

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

    rmv(key) {

        if (!key) {

            throw Error('key is required');
        }

        if (arguments.length > 1) {

            Array.from(arguments).forEach(k => this.rmv(k));
        }

        return this._storage.removeItem(this.key(key));
    }

    clear() {

        if (this.prefix) {

            const all = this.strippedPrefix(this.filterPrefixedKeys());
            return this.rmv(...all);
        }

        this._storage.clear();
    }

    get length () {

        if (this.prefix) {

            return this.filterPrefixedKeys().length
        }

        return this._storage.length;
    }

    get all() {

        let all = this.filterPrefixedKeys();

        if (this.prefix) {

            all = this.strippedPrefix(all);
        }

        console.log(all);

        return this.get(...all)
    }

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

    each(fn) {

        if (fn.constructor !== Function) {

            throw Error('argument is not a function');
        }

        Object.entries(this.all).forEach((v) => fn(...v));
    }

    map(fn) {

        if (fn.constructor !== Function) {

            throw Error('argument is not a function');
        }

        return Object.entries(this.all).map((v) => fn(...v));
    }
}
