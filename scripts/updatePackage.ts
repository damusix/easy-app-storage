import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
    name,
    version,
    main,
    module,
    cdn,
    types,
    license
} from '../package.json';

const paths = {
    pkg: join(__dirname, '../build/package.json'),
    browser: join(__dirname, '../build/browser.js'),
    cjs: join(__dirname, '../build/cjs.js'),
    es: join(__dirname, '../build/es.js'),
};

writeFileSync(
    paths.pkg,
    JSON.stringify({
        name,
        version,
        main,
        module,
        cdn,
        types,
        license
    })
);

const contents = {

    browser: readFileSync(paths.browser),
    cjs: readFileSync(paths.cjs),
    es: readFileSync(paths.es),
};

const replaceVersion = (contents: string) => contents.replace(
    '%VERSION%',
    version
);

writeFileSync(
    paths.browser,
    replaceVersion(contents.browser.toString())
);

writeFileSync(
    paths.cjs,
    replaceVersion(contents.cjs.toString())
);

writeFileSync(
    paths.browser,
    replaceVersion(contents.browser.toString())
);
