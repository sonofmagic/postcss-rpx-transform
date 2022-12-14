import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import pkg from './package.json'
// import json from '@rollup/plugin-json'
// import replace from '@rollup/plugin-replace'
// import { terser } from 'rollup-plugin-terser'
const isProd = process.env.NODE_ENV === 'production'
const isDev = process.env.NODE_ENV === 'development'

/** @type {import('rollup').RollupOptions} */
const config = {
  input: {
    index: 'src/index.ts',
    postcss7: 'src/postcss7.ts'
  },
  // { index: 'src/index.ts', cli: 'src/cli.ts' },
  output: [
    {
      dir: 'dist',
      format: 'cjs',
      sourcemap: isDev,
      exports: 'auto'
    }
  ],

  plugins: [
    nodeResolve({
      preferBuiltins: true
    }),
    commonjs(),
    typescript({ tsconfig: './tsconfig.build.json', sourceMap: isDev }),
    isProd
      ? {
          name: 'postcss7-renamer',
          renderChunk (code, chunk) {
            if (chunk.fileName === 'postcss7.js') {
              return {
                code: code.replace(
                  /require\('postcss7'\)/g,
                  "require('postcss')"
                )
              }
            }
          }
        }
      : undefined
  ],
  external: [
    ...(pkg.dependencies
      ? Object.keys(pkg.dependencies)
      : ['postcss', 'postcss7'])
  ]
}

export default config
