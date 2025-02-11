import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: ['./src/index.ts'],
    output: {
      format: "es",
      dir: 'dist',
      // exports: "named",
      sourcemap: true,
    },
    plugins: [
      typescript({ compilerOptions: { outDir: "./dist" } })
    ]
  }
  // {
  //   input: ['./src/fs/index.ts','./src/util/logging.ts'],
  //   output: {
  //     file: 'dist/fs/index.js',
  //     format: 'iife',
  //   },
  //   plugins: [
  //     typescript()
  //   ]
  // }
]
