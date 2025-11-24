import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load package.json
const pkg = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './package.json'), 'utf-8')
);

const libraryName = 'QorPaySDK'; // For UMD build

const input = 'src/index.ts';

const commonPlugins = [
  resolve({ browser: true }), // Resolve node modules
  commonjs(), // Convert CommonJS modules to ES6
  json(), // Allow importing JSON files
  typescript({
    tsconfig: './tsconfig.json',
    sourceMap: true,
    declaration: true,
    declarationDir: './dist/types',
    exclude: ['**/*.test.ts', '**/*.spec.ts', 'node_modules/**', 'dist/**'],
  }),
];

export default [
  // ESM build (for modern bundlers)
  {
    input,
    output: {
      file: pkg.module,
      format: 'esm',
      sourcemap: true,
      globals: {
        axios: 'axios', // Externalize axios
      },
    },
    plugins: [...commonPlugins],
    external: ['axios'], // Specify external dependencies
  },
  // CommonJS build (for Node.js)
  {
    input,
    output: {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'named', // Important for CJS interop
      globals: {
        axios: 'axios',
      },
    },
    plugins: [...commonPlugins],
    external: ['axios'],
  },
  // UMD build (for browsers directly)
  {
    input,
    output: {
      file: pkg.browser,
      format: 'umd',
      name: libraryName, // Global variable name for UMD
      sourcemap: true,
      globals: {
        axios: 'axios', // Axios will be expected as a global or via require
      },
    },
    plugins: [
      ...commonPlugins,
      terser(), // Minify UMD build
    ],
    external: ['axios'],
  },
];
