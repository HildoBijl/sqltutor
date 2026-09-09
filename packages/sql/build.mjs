import { build } from 'esbuild';
import { readFile, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageDirectory = dirname(fileURLToPath(import.meta.url));
const outputDirectory = resolve(packageDirectory, 'dist');
const require = createRequire(import.meta.url);
const wasmBinary = await readFile(require.resolve('sql.js/dist/sql-wasm.wasm'));

await rm(outputDirectory, { recursive: true, force: true });

await build({
  entryPoints: {
    index: './src/index.ts',
    'sqljs/index': './src/sqljs/index.ts',
    'sqljs/types': './src/sqljs/types.ts',
    'databases/index': './src/databases/index.ts',
  },
  absWorkingDir: packageDirectory,
  bundle: true,
  splitting: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  jsx: 'automatic',
  outdir: outputDirectory,
  sourcemap: true,
  define: {
    SQLJS_WASM_BASE64: JSON.stringify(wasmBinary.toString('base64')),
  },
  external: [
    '@codemirror/*',
    '@lezer/*',
    '@mui/*',
    '@sqlvalley/*',
    '@uiw/*',
    'react',
    'react/*',
    'sql.js',
  ],
});
