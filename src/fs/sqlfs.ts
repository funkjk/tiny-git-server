import { DataTypes, Op, Sequelize, Transaction, WhereOptions } from "sequelize"
import { Model, Optional } from 'sequelize';
import { DefaultLogging, Logging, LogLevel } from "../util/logging";
import cls from 'cls-hooked'

export const NAMESPACE_TRANSACTION_NAME = "transaction"
export enum GitFileType {
    DIR = "DIR",
    FILE = "FILE"
}
export type FileAttributes = {
    id?: number;
    filepath: string;
    fileType: GitFileType;
    fileSize?: number;
    data?: Buffer;
};

export type FileCreationAttributes = Optional<FileAttributes, 'id'>;

export class GitFile extends Model<FileAttributes, FileCreationAttributes> {
    declare id?: number;
    declare filepath: string;
    declare fileType: GitFileType;
    declare ctime: Date;
    declare mtime: Date;
    declare fileSize?: number;
    declare data?: Buffer;
}
export const GitFileDbDefinition = {
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

export interface SQLFSOptions {
    logging?: Logging;
    namespace?: cls.Namespace<Record<string, any>>;
    FileClass?: typeof GitFile;
    gitFileDbDefinition?: any
    tableName?:string;
    sequelize: Sequelize;
}

export class SQLFS {
    repositoryId?: string;
    logging: Logging;
    namespace?: cls.Namespace<Record<string, any>>
    FileClass: typeof GitFile
    constructor(options: SQLFSOptions) {
        this.logging = options.logging ?? DefaultLogging
        this.namespace = options.namespace
        this.FileClass = options.FileClass ?? GitFile

        const tableName = options.tableName ?? "files"
        const dbDefinition = options.gitFileDbDefinition ?? GitFileDbDefinition
        this.FileClass.init(dbDefinition, {
            tableName: tableName,
            timestamps: true,
            updatedAt: 'mtime',
            createdAt: 'ctime',
            sequelize: options.sequelize
        })
    }
    async readFile(filepath: string, encoding: any): Promise<any> {
        const result = await this.FileClass.findOne({
            attributes: ["data"],
            where: {
                filepath,
                ...this._getAdditionalCondition()
            },
            transaction: this._getTransaction()
        })
        if (result === null) {
            this.logging(LogLevel.DEBUG, "in readFile(not found)" + encoding + ":" + filepath)
            throw new Error(`File not found: ${filepath}`);
        }
        let data
        if (typeof encoding == "string") {
            data = new TextDecoder(encoding).decode(result.data!);
        } else if (encoding && encoding.encoding) {
            data = new TextDecoder(encoding.encoding).decode(result.data!);
        } else {
            data = result.data
        }
        this.logging(LogLevel.DEBUG, "in readFile(found):" + filepath, encoding)
        return data
    }
    async writeFile(filepath: string, content: Buffer | string): Promise<void> {
        this.logging(LogLevel.DEBUG, "in writeFile:" + filepath)
        const bufferContent = typeof content === "string" ? Buffer.from(content) : content;
        const fileSize = Buffer.byteLength(bufferContent)
        if (fileSize > 1024 * 1024 * 3) {
            throw new Error("file size over 3MB error [" + fileSize + "] " + filepath)
        }
        const row = {
            filepath,
            data: bufferContent,
            fileType: GitFileType.FILE,
            fileSize,
            ...this._setAdditionalProperties()
        }
        await this.FileClass.upsert(row, { conflictFields: ["filepath"], transaction: this._getTransaction() })
    }
    async unlink(filepath: string): Promise<void> {
        this.logging(LogLevel.DEBUG, "in unlink:" + filepath)
        await this.FileClass.destroy({
            where: {
                filepath,
                ...this._getAdditionalCondition()
            }
        })
    }
    async readdir(dir: string): Promise<string[]> {
        this.logging(LogLevel.DEBUG, "in readdir:" + dir)
        const result = await this.FileClass.findAll(
            {
                attributes: ["filepath"],
                where: {
                    filepath: { [Op.like]: `${dir}/%` },
                    ...this._getAdditionalCondition()
                },
                transaction: this._getTransaction()
            })
        // filter only direct children
        const children = result
            .map(row => row.filepath.substring(dir.length + 1))

        // TODO unique?

        this.logging(LogLevel.DEBUG, "readdir children", children)
        return children
    }
    async mkdir(dir: string): Promise<void> {
        this.logging(LogLevel.DEBUG, "in mkdir:" + dir)
        const row = {
            filepath: dir, fileType: GitFileType.DIR,
            repositoryId: this.repositoryId,
            ...this._setAdditionalProperties()
        }
        await this.FileClass.upsert(row, { conflictFields: ["filepath"], transaction: this._getTransaction() })
    }
    async rmdir(dir: string): Promise<void> {
        this.logging(LogLevel.DEBUG, "in rmdir:" + dir)
        await this.FileClass.destroy({
            where: {
                filepath: {
                    [Op.like]: `${dir}%`
                },
                ...this._getAdditionalCondition()
            }
            , transaction: this._getTransaction()
        })
    }
    async stat(filepath: string): Promise<{ isDirectory: () => boolean, isFile: () => boolean, isSymbolicLink: () => boolean }> {
        // TODO read dir using prefix match
        const result = await this.FileClass.findOne({
            attributes: ["fileType", "ctime", "mtime"],
            where: {
                filepath,
                ...this._getAdditionalCondition()
            },
            transaction: this._getTransaction()
        })
        if (result) {
            const stat = {
                isDirectory: () => result.fileType == GitFileType.DIR,
                isFile: () => result.fileType != GitFileType.DIR,
                isSymbolicLink: () => false,
                ctime: result.ctime,
                mtime: result.mtime,
            };
            this.logging(LogLevel.DEBUG, "in stat(found):" + filepath, stat.isFile())
            return stat
        } else {
            this.logging(LogLevel.DEBUG, "in stat(not found):" + filepath)
            throw { code: "ENOENT" }
        }
    }
    async lstat(filepath: string): Promise<{ isDirectory: () => boolean, isFile: () => boolean }> {
        this.logging(LogLevel.DEBUG, "in lstat:" + filepath)
        return this.stat(filepath);
    }
    async readlink(_filepath: string): Promise<void> {
        throw new Error("readlink not implemented");
    }
    async symlink(_target: string, _filepath: string): Promise<void> {
        throw new Error("symlink not implemented");
    }
    _getTransaction(): Transaction | null {
        return this.namespace?.get(NAMESPACE_TRANSACTION_NAME)
    }
    _getAdditionalCondition(): WhereOptions<any> {
        return {}
    }
    _setAdditionalProperties(): WhereOptions<any> {
        return {}
    }
}
