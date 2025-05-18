import typescript from '@rollup/plugin-typescript';
import del from 'rollup-plugin-del'
const outputDir = 'dist'
export default [
  {
    input: ['./src/index.ts'],
    output: {
      format: "cjs",
      dir: outputDir,
      sourcemap: true,
    },
    plugins: [
      del(),
      typescript({ compilerOptions: { outDir: outputDir } })
    ]
  }
]
