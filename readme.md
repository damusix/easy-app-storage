# Simple JSON local storage wrapper

Why? Because semantic, simple, and non-clashing.
I have yet to find anything that's easy, functional, and non-verbose, so I made this package.

Supports namespaced keys. Package is distributed as-is, meant to be used in modern browsers, or in build tools that compile ES2017 or greater. Basically, if your node / transpiler supports spread operators, this package should be no problem.

# Usage

```js
const BetterWebStorage = require('better-web-storage');

// uses local storage and sets keys prefixed with 'myapp'
const store = new BetterWebStorage({ local: true, prefix: 'myapp' });
const store2 = new BetterWebStorage({ local: true, prefix: 'otherapp' });

store.set('test', true);
store2.set('test', false);

localStorage
// > { "myapp_test": "true", "otherapp_test": "false" }

```


# API

### `set(key, val)`
Sets `key` to stringified `val`. When passed an object, it will iterate through the object and set key val to storage.

```js
// Single value
store.set('test', true);

// Entire object
store.set({
    auth: 'abcdefgh',
    userId: 5,
    permissions: ['post:read']
});
```

### `get(keys)`
Retrieves and parses stored `key`. When multiple values are passed, it returns an object of those keys' values.

```js
store.get('test')
// > true

store.get('auth', 'userId');

// > {
//     auth: 'abcdefgh',
//     userId: 5
// }
```


### `has(key)`
Returns true when `key` exists. Can pass multiple keys and it will return true if all keys exist.

```js
store.has('test')
// > true

store.has('test', 'auth', 'permissions')
// > true

store.has('userId', 'password')
// > false
```

### `rmv(key)`
Removes `key`. Can pass multiple keys to remove.

```js
store.rmv('test', 'auth', 'permissions')
```

### `assign(key, val)`
Object assigns `val` to `key`. Both `val` and `key` item must be an object.

```js
store.set('obj', { a: true });
store.assign('obj', { b: true });

store.get('obj');
// > { a: true, b: true }
```

### `each(fn)`
Iterates through store entries and executes a user-defined function. If storage is prefixed, it will only iterate through prefixed keys.

```js
store.each((key, val) => alert(`${key} equals ${val}`));
```

### `map(fn)`
Maps through store entries and executes a user-defined function. Returns an array of mapped items. If storage is prefixed, it will only iterate through prefixed keys.

```js
const ids = store.map((key, val) => [key, val].join('-'));
```

### `clear()`
Removes all keys. If your storage is prefixed, it will only remove the prefixed keys.

### `length`
Returns length of keys. If your storage is prefixed, it will only give the length of prefixed keys

### `all`
Returns all keys. If your storage is prefixed, it will only give return all prefixed keys.


## Utility Functions

### `key(key)`
Generates a key based on prefix

### `filterPrefixedKeys()`
Returns an array of prefixed keys

### `strippedPrefix(keysArray)`
Strips the prefix from keys




# Development

If you want to develop for this library, nothing will be accepted without tests. Tests are ran using `mocha` and `chai`. This is a browser package, so all tests are made in browser;

To build project, run `npm run build`.
To run tests, build first, then open `test.html` in your browser.
