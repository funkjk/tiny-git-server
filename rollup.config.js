import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: ['./src/index.ts'],
    output: {
      format: "es",
      dir: 'dist',
      sourcemap: true,
    },
    plugins: [
      typescript({ compilerOptions: { outDir: "./dist" } })
    ]
  }
]
