import babel from "@rollup/plugin-babel";
import typescript from "@rollup/plugin-typescript";
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import pkg from "./package.json";
import * as path from "path";
const banner = `/*!
  niwango.js v${pkg.version}
  (c) 2021 xpadev-net https://xpadev.net
  Released under the ${pkg.license} License.
*/`;

export default {
    input: 'src/main.ts',
    output: {
        file: 'dist/bundle.js',
        format: 'umd',
        name: 'niwango',
        banner
    },
    plugins: [
        typescript(),
        json(),
        commonjs(),
        nodeResolve(),
        babel({
            babelHelpers: "bundled",
            configFile: path.resolve(__dirname, ".babelrc.js"),
        }),
    ]
}