import typescript from '@rollup/plugin-typescript';
import del from 'rollup-plugin-del'
// const { LERNA_PACKAGE_NAME } = process.env
// const packageName = LERNA_PACKAGE_NAME.replace("@tiny-git-server/", "")
const outputDir = 'dist'
export default [
  {
    input: {
      "index": './src/base.ts',
      "sql/index": './src/sql/index.ts',
      "sql/pg/index": './src/sql/pg/index.ts',
      "sequelize-sqlfs/index": './src/sequelize-sqlfs/index.ts'
    },
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
