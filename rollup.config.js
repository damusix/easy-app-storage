import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import del from 'rollup-plugin-delete';

import pkg from './package.json';
import path from 'path';


const libraryName = 'AppStorage';

const buildPath = 'build';
const wrapToBuildPath = (name) => path.join(__dirname, buildPath, name);

export default [
    {
        input: 'src/index.ts',
        plugins: [

            del({ targets: wrapToBuildPath('*') }),

            typescript({ useTsconfigDeclarationDir: true }),

            terser(),
        ],
        output: [
            {
                file: wrapToBuildPath(pkg.module),
                format: 'es',
                // sourcemap: true
            },
            {
                file: wrapToBuildPath(pkg.main),
                name: libraryName,
                format: 'umd',
                // sourcemap: true
            },
            {
                name: libraryName,
                file: wrapToBuildPath(pkg.cdn),
                format: 'iife',
                // sourcemap: true,
                inlineDynamicImports: true
            }
        ]
    }
];