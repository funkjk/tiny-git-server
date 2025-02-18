import { DataTypes, Sequelize, Transaction } from "sequelize";
import { Model, Optional } from 'sequelize';
import { Logging } from "@tiny-git-server/util";
import cls from 'cls-hooked';
import { GitFileType, SQLFS, SqlMeta } from "./sqlfs";
export declare const NAMESPACE_TRANSACTION_NAME = "transaction";
export interface SequelizeSQLFSOptions {
    logging?: Logging;
    namespace?: cls.Namespace<Record<string, any>>;
    FileClass?: typeof SequelizeGitFile;
    gitFileDbDefinition?: any;
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
export declare class SequelizeGitFile extends Model<SequelizeFileAttributes, SequelizeFileCreationAttributes> {
    id?: number;
    filepath: string;
    fileType: GitFileType;
    ctime: Date;
    mtime: Date;
    fileSize?: number;
    data?: Buffer;
}
export declare const SequelizeGitFileDbDefinition: {
    id: {
        type: DataTypes.IntegerDataTypeConstructor;
        autoIncrement: boolean;
        primaryKey: boolean;
    };
    filepath: {
        type: DataTypes.StringDataType;
        allowNull: boolean;
    };
    fileType: {
        type: DataTypes.StringDataType;
        field: string;
        allowNull: boolean;
    };
    fileSize: {
        type: DataTypes.IntegerDataType;
        field: string;
        allowNull: boolean;
    };
    data: {
        type: DataTypes.BlobDataType;
        allowNull: boolean;
    };
};
export declare class SequelizeSQLFS extends SQLFS {
    namespace?: cls.Namespace<Record<string, any>>;
    FileClass: typeof SequelizeGitFile;
    constructor(options: SequelizeSQLFSOptions);
    _createCTimeMTime(): {};
    _getTransaction(): Transaction | null;
    _upsert(row: SqlMeta): Promise<void>;
    _delete(filepath: string, prematch: boolean): Promise<void>;
    _selectData(filepath: string): Promise<Buffer | null>;
    _selectMetaChild(dir: string): Promise<SqlMeta[]>;
    _selectMeta(filepath: string): Promise<SqlMeta | null>;
}
