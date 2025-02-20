
import { SequelizeGitFile, SequelizeGitFileDbDefinition, SequelizeSQLFS } from '../../packages/fs/src';

import { DataTypes, Sequelize } from 'sequelize'
import cls from 'cls-hooked'
import { sqlfsLogging, sqlLogger } from './create-logger';

export const namespace = cls.createNamespace('sequelize-transaction');

export const sequelize = new Sequelize(
    process.env.DATABASE_URL!,
    {
        dialect: 'postgres',
        logging(sql, _timing) {
            sqlLogger.debug(sql)
        },
    }
)

class RepositoryIdFileClass extends SequelizeGitFile {
    declare repositoryId: string;
}

export const sqlfs = new SequelizeSQLFS({
    logging: sqlfsLogging, namespace, sequelize,
    gitFileDbDefinition: {
        repositoryId: {
            type: new DataTypes.STRING(256),
            field: "repository_id",
            allowNull: false
        },
        ...SequelizeGitFileDbDefinition
    },
    FileClass: RepositoryIdFileClass
})
sqlfs._getAdditionalCondition = function () {
    return { "repositoryId": "efe30e56-3e48-b8ef-5500-5941fb97ebe1" }
    // return {}
}
sqlfs._setAdditionalProperties = function () {
    return { "repositoryId": "efe30e56-3e48-b8ef-5500-5941fb97ebe1" }
    // return {}
}