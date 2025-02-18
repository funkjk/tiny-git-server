import * as igit from '@tiny-git-server/util';
import { DefaultLogging, LogLevel } from '@tiny-git-server/util';
import { DataTypes, Model, Op } from 'sequelize';
import JSZip from 'jszip';

var GitFileType;
(function (GitFileType) {
    GitFileType["DIR"] = "DIR";
    GitFileType["FILE"] = "FILE";
})(GitFileType || (GitFileType = {}));
class SQLFS {
    constructor(options) {
        this.logging = options.logging ?? DefaultLogging;
    }
    async readFile(filepath, encoding) {
        if (!filepath) {
            return new Promise(resolve => resolve(1));
        }
        try {
            const resultData = await this._selectData(filepath);
            if (resultData) {
                let data;
                if (typeof encoding == "string") {
                    data = new TextDecoder(encoding).decode(resultData);
                }
                else if (encoding && encoding.encoding) {
                    data = new TextDecoder(encoding.encoding).decode(resultData);
                }
                else {
                    data = resultData;
                }
                this.logging(LogLevel.DEBUG, "in readFile(found):" + filepath, encoding);
                return data;
            }
        }
        catch (e) {
            this.logging(LogLevel.ERROR, e);
            throw e;
        }
        this.logging(LogLevel.DEBUG, "in readFile(not found)" + encoding + ":" + filepath);
        throw new Error(`File not found: ${filepath}`);
    }
    async writeFile(filepath, content) {
        this.logging(LogLevel.DEBUG, "in writeFile:" + filepath);
        const bufferContent = typeof content === "string" ? Buffer.from(content) : content;
        const fileSize = Buffer.byteLength(bufferContent);
        const row = {
            filepath,
            data: bufferContent,
            fileType: GitFileType.FILE,
            fileSize,
            ...this._createCTimeMTime(),
            ...this._setAdditionalProperties()
        };
        await this._upsert(row);
    }
    async unlink(filepath) {
        this.logging(LogLevel.DEBUG, "in unlink:" + filepath);
        return await this._delete(filepath, false);
    }
    async readdir(dir) {
        this.logging(LogLevel.DEBUG, "in readdir:" + dir);
        const result = await this._selectMetaChild(dir);
        // filter only direct children
        let children = result
            .map(row => row.filepath.substring(dir.length + 1))
            .map(filepath => filepath.substring(0, filepath.indexOf("/") > 0 ? filepath.indexOf("/") : filepath.length));
        children = uniq(children);
        this.logging(LogLevel.DEBUG, "readdir children", children);
        return children;
    }
    async mkdir(dir) {
        this.logging(LogLevel.DEBUG, "in mkdir:" + dir);
        const row = {
            filepath: dir,
            fileType: GitFileType.DIR,
            ...this._createCTimeMTime(),
            ...this._setAdditionalProperties()
        };
        await this._upsert(row);
    }
    async rmdir(dir) {
        this.logging(LogLevel.DEBUG, "in rmdir:" + dir);
        await this._delete(dir, true);
    }
    async stat(filepath) {
        const result = await this._selectMeta(filepath);
        if (result) {
            const stat = {
                isDirectory: () => result.fileType == GitFileType.DIR,
                isFile: () => result.fileType != GitFileType.DIR,
                isSymbolicLink: () => false,
                ctime: result.ctime,
                mtime: result.mtime,
            };
            this.logging(LogLevel.DEBUG, "in stat(found):" + filepath, stat.isFile());
            return stat;
        }
        else {
            const children = await this._selectMetaChild(filepath);
            if (children.length > 0) {
                const stat = {
                    isDirectory: () => true,
                    isFile: () => false,
                    isSymbolicLink: () => false,
                    ctime: children[0].ctime,
                    mtime: children[0].mtime,
                };
                this.logging(LogLevel.DEBUG, "in stat(found dir):" + filepath);
                return stat;
            }
            this.logging(LogLevel.DEBUG, "in stat(not found):" + filepath);
            throw { code: "ENOENT" };
        }
    }
    async lstat(filepath) {
        this.logging(LogLevel.DEBUG, "in lstat:" + filepath);
        return this.stat(filepath);
    }
    async readlink(_filepath) {
        throw new Error("readlink not implemented");
    }
    async symlink(_target, _filepath) {
        throw new Error("symlink not implemented");
    }
    _getAdditionalCondition() {
        return {};
    }
    _setAdditionalProperties() {
        return {};
    }
    _createCTimeMTime() {
        return {
            ctime: new Date(),
            mtime: new Date(),
        };
    }
}
function uniq(array) {
    return Array.from(new Set(array));
}

const NAMESPACE_TRANSACTION_NAME = "transaction";
class SequelizeGitFile extends Model {
}
const SequelizeGitFileDbDefinition = {
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
};
class SequelizeSQLFS extends SQLFS {
    constructor(options) {
        super(options);
        this.namespace = options.namespace;
        this.FileClass = options.FileClass ?? SequelizeGitFile;
        const tableName = options.tableName ?? "files";
        const dbDefinition = options.gitFileDbDefinition ?? SequelizeGitFileDbDefinition;
        this.FileClass.init(dbDefinition, {
            tableName: tableName,
            timestamps: true,
            updatedAt: 'mtime',
            createdAt: 'ctime',
            sequelize: options.sequelize
        });
    }
    _createCTimeMTime() {
        // dont create ctime/mtime because use Sequelize facility
        return {};
    }
    _getTransaction() {
        return this.namespace?.get(NAMESPACE_TRANSACTION_NAME);
    }
    async _upsert(row) {
        await this.FileClass.upsert(row, { conflictFields: ["filepath"], transaction: this._getTransaction() });
    }
    async _delete(filepath, prematch) {
        await this.FileClass.destroy({
            where: {
                filepath: prematch ? { [Op.like]: `${filepath}/%` } : filepath,
                ...this._getAdditionalCondition()
            }
        });
    }
    async _selectData(filepath) {
        const result = await this.FileClass.findOne({
            attributes: ["data"],
            where: {
                filepath,
                ...this._getAdditionalCondition()
            },
            transaction: this._getTransaction()
        });
        if (result) {
            return result.data;
        }
        else {
            return null;
        }
    }
    async _selectMetaChild(dir) {
        const row = await this.FileClass.findAll({
            attributes: ["filepath", "fileType", "ctime", "mtime"],
            where: {
                filepath: {
                    [Op.like]: `${dir}/%`
                },
                ...this._getAdditionalCondition()
            },
            transaction: this._getTransaction()
        });
        return row;
    }
    async _selectMeta(filepath) {
        const row = await this.FileClass.findOne({
            attributes: ["filepath", "fileType", "ctime", "mtime"],
            where: {
                filepath,
                ...this._getAdditionalCondition()
            },
            transaction: this._getTransaction()
        });
        return row;
    }
}

async function createZip(_fs, dir) {
    const fs = new igit.FileSystem(_fs);
    const zip = new JSZip();
    await toZip(fs, dir, zip);
    return zip;
}
async function toZip(fs, dir, folder) {
    const indirlist = await fs._readdir(dir);
    for (let fname of indirlist) {
        const filename = `${dir}/${fname}`;
        const fstat = await fs._stat(filename);
        if (fstat.isDirectory()) {
            const childFolder = folder.folder(fname);
            await toZip(fs, filename, childFolder);
        }
        else {
            const data = await fs._readFile(filename);
            folder.file(fname, data);
        }
    }
}

export { GitFileType, NAMESPACE_TRANSACTION_NAME, SQLFS, SequelizeGitFile, SequelizeGitFileDbDefinition, SequelizeSQLFS, createZip };
//# sourceMappingURL=index.js.map
