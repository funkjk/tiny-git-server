import typescript from '@rollup/plugin-typescript';
import del from 'rollup-plugin-del'
const { LERNA_PACKAGE_NAME } = process.env
const packageName = LERNA_PACKAGE_NAME.replace("@tiny-git-server/", "")
const outputDir = '../../dist/'+packageName
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
