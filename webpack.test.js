
// Simulate local storage
class STORAGE {
    getItem(key) {
        return this[key];
    }
    setItem(key, val) {
        this[key] = val.toString();
    }
    removeItem(key) {
        delete this[key]
    }
    clear() {
        Object.keys(this).forEach((k) => {
            delete this[k]
        })
    }
    get length() {
        return Object.keys(this).length
    }
}

if (!global.window) {

    global.window = {

        localStorage: new STORAGE(),
        sessionStorage: new STORAGE()
    };
}



module.exports = {
    entry: "./test.js",
    output: {
        path: __dirname + '/tmp',
        filename: "test.js"
    },
    mode: 'production',
    optimization: {
        usedExports: true
    }
}
