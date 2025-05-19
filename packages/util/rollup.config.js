import base from "../../rollup.config"
base[0].input = {
  "index": './src/base.ts',
  "sql/index": './src/sql/index.ts',
  "sql/pg/index": './src/sql/pg/index.ts',
  "sequelize-sqlfs/": './src/sequelize-sqlfs/index.ts'
}
export default base