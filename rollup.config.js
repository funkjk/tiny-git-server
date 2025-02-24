import typescript from '@rollup/plugin-typescript';
import del from 'rollup-plugin-del'
export default [
  {
    input: ['./src/index.ts'],
    output: {
      format: "cjs",
      dir: 'dist',
      sourcemap: true,
    },
    plugins: [
      del(),
      typescript({ compilerOptions: { outDir: "./dist" } })
    ]
  }
]
