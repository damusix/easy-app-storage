const Pkg = require('./package.json');

module.exports = {
    entry: "./src/index.js",
    output: {
        path: __dirname + '/dist',
        filename: 'index.js',
        library: {
            root: 'BetterWebStorage',
            commonjs: 'BetterWebStorage'
        },
        libraryTarget: 'umd',
        libraryExport: 'default'
    },
    mode: 'production',
    optimization: {
        usedExports: true
    }
};
