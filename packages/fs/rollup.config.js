import typescript from '@rollup/plugin-typescript';
import del from 'rollup-plugin-del'
// const { LERNA_PACKAGE_NAME } = process.env
// const packageName = LERNA_PACKAGE_NAME.replace("@tiny-git-server/", "")
const outputDir = 'dist'
export default [
  {
    input: ['./src/base.ts','./src/sql/index.ts','./src/sql/pg/index.ts','./src/sequelize-sqlfs/index.ts'],
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
