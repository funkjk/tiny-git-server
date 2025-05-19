
import { DataTypes, Op, Sequelize, Transaction } from "sequelize"
import { Model, Optional } from 'sequelize';
import cls from 'cls-hooked'
import { GitFileType, BaseFS, GitFileMeta, BaseFSOptions } from "../base";

export const NAMESPACE_TRANSACTION_NAME = "transaction"

export interface SequelizeSQLFSOptions extends BaseFSOptions {
    namespace?: cls.Namespace<Record<string, any>>;
    FileClass?: typeof SequelizeGitFile;
    gitFileDbDefinition?: any
    tableName?: string;
    sequelize: Sequelize;
}

export type SequelizeFileAttributes = {
    id?: number;
    filepath: string;
    fileType: GitFileType;
    fileSize?: number;
    data?: Buffer;
};

export type SequelizeFileCreationAttributes = Optional<SequelizeFileAttributes, 'id'>;

export class SequelizeGitFile extends Model<SequelizeFileAttributes, SequelizeFileCreationAttributes> {
    declare id?: number;
    declare filepath: string;
    declare fileType: GitFileType;
    declare ctime: Date;
    declare mtime: Date;
    declare fileSize?: number;
    declare data?: Buffer;
}
export const SequelizeGitFileDbDefinition = {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    filepath: {
        type: new DataTypes.STRING(256),
        allowNull: false,
    },
    fileType: {
        type: new DataTypes.STRING(256),
        field: "file_type",
        allowNull: false
    },
    fileSize: {
        type: new DataTypes.INTEGER,
        field: "file_size",
        allowNull: true
    },
    data: {
        type: new DataTypes.BLOB,
        allowNull: true
    },
}


export class SequelizeSQLFS extends BaseFS{
    namespace?: cls.Namespace<Record<string, any>>
    FileClass: typeof SequelizeGitFile
    constructor(options: SequelizeSQLFSOptions) {
        super(options)
        this.namespace = options.namespace
        this.FileClass = options.FileClass ?? SequelizeGitFile

        const tableName = options.tableName ?? "files"
        const dbDefinition = options.gitFileDbDefinition ?? SequelizeGitFileDbDefinition
        this.FileClass.init(dbDefinition, {
            tableName: tableName,
            timestamps: true,
            updatedAt: 'mtime',
            createdAt: 'ctime',
            sequelize: options.sequelize
        })
    }
    _createCTimeMTime() {
        // dont create ctime/mtime because use Sequelize facility
        return {}
    }
    _getTransaction(): Transaction | null {
        return this.namespace?.get(NAMESPACE_TRANSACTION_NAME)
    }
    async _upsert(row: GitFileMeta): Promise<void> {
        await this.FileClass.upsert(row, { conflictFields: ["filepath"], transaction: this._getTransaction() })
    }
    async _delete(filepath: string, prematch: boolean): Promise<void> {
        await this.FileClass.destroy({
            where: {
                filepath: prematch ? { [Op.like]: `${filepath}/%` } : filepath,
                ...this._getAdditionalCondition()
            }
        })
    }
    async _selectData(filepath: string): Promise<Buffer | null> {
        const result = await this.FileClass.findOne({
            attributes: ["data"],
            where: {
                filepath,
                ...this._getAdditionalCondition()
            },
            transaction: this._getTransaction()
        })
        if (result) {
            return result.data as Buffer
        } else {
            return null
        }
    }
    async _selectMetaChild(dir: string): Promise<GitFileMeta[]> {
        const row = await this.FileClass.findAll({
            attributes: ["filepath", "fileType", "ctime", "mtime"],
            where: {
                filepath: {
                    [Op.like]: `${dir}/%`
                },
                ...this._getAdditionalCondition()
            },
            transaction: this._getTransaction()
        })
        return row
    }
    async _selectMeta(filepath: string): Promise<GitFileMeta | null> {
        const row = await this.FileClass.findOne({
            attributes: ["filepath", "fileType", "ctime", "mtime"],
            where: {
                filepath,
                ...this._getAdditionalCondition()
            },
            transaction: this._getTransaction()
        })
        return row
    }
}