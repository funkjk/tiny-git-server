import { DefaultLogging, Logging, LogLevel } from "@funkjk/tiny-git-server-util";

export enum GitFileType {
    DIR = "DIR",
    FILE = "FILE"
}

export interface BaseFSOptions {
    logging?: Logging;
}

export abstract class BaseFS {
    logging: Logging;
    constructor(options: BaseFSOptions) {
        this.logging = options.logging ?? DefaultLogging
    }
    async readFile(filepath: string, encoding: any): Promise<any> {
        if (!filepath) {
            return new Promise(resolve => resolve(1))
        }
        try {
            const resultData = await this._selectData(filepath)
            if (resultData) {
                let data
                if (typeof encoding == "string") {
                    data = new TextDecoder(encoding).decode(resultData);
                } else if (encoding && encoding.encoding) {
                    data = new TextDecoder(encoding.encoding).decode(resultData);
                } else {
                    data = resultData
                }
                this.logging(LogLevel.DEBUG, "in readFile(found):" + filepath, encoding)
                return data
            }
        } catch (e) {
            this.logging(LogLevel.ERROR, e)
            throw e
        }
        this.logging(LogLevel.DEBUG, "in readFile(not found)" + encoding + ":" + filepath)
        throw new Error(`File not found: ${filepath}`);
    }
    async writeFile(filepath: string, content: Buffer | string): Promise<void> {
        this.logging(LogLevel.DEBUG, "in writeFile:" + filepath)
        const bufferContent = typeof content === "string" ? Buffer.from(content) : content;
        const fileSize = Buffer.byteLength(bufferContent)
        const row = {
            filepath,
            data: bufferContent,
            fileType: GitFileType.FILE,
            fileSize,
            ...this._createCTimeMTime(),
            ...this._setAdditionalProperties()
        }
        await this._upsert(row)
    }
    async unlink(filepath: string): Promise<void> {
        this.logging(LogLevel.DEBUG, "in unlink:" + filepath)
        return await this._delete(filepath, false)
    }
    async readdir(dir: string): Promise<string[]> {
        this.logging(LogLevel.DEBUG, "in readdir:" + dir)
        const result = await this._selectMetaChild(dir)
        // filter only direct children
        let children = result
            .map(row => row.filepath.substring(dir.length + 1))
            .map(filepath => filepath.substring(0, filepath.indexOf("/") > 0 ? filepath.indexOf("/") : filepath.length))
        children = uniq(children)

        this.logging(LogLevel.DEBUG, "readdir children", children)
        return children
    }
    async mkdir(dir: string): Promise<void> {
        this.logging(LogLevel.DEBUG, "in mkdir:" + dir)
        const row = {
            filepath: dir,
            fileType: GitFileType.DIR,
            ...this._createCTimeMTime(),
            ...this._setAdditionalProperties()
        }
        await this._upsert(row)
    }
    async rmdir(dir: string): Promise<void> {
        this.logging(LogLevel.DEBUG, "in rmdir:" + dir)
        await this._delete(dir, true)
    }
    async stat(filepath: string): Promise<{ isDirectory: () => boolean, isFile: () => boolean, isSymbolicLink: () => boolean }> {
        const result = await this._selectMeta(filepath)
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
            const children = await this._selectMetaChild(filepath)
            if (children.length > 0) {
                const stat = {
                    isDirectory: () => true,
                    isFile: () => false,
                    isSymbolicLink: () => false,
                    ctime: children[0].ctime,
                    mtime: children[0].mtime,
                };
                this.logging(LogLevel.DEBUG, "in stat(found dir):" + filepath)
                return stat
            }
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
    toString(): string {
        return this.constructor.name
    }
    _getAdditionalCondition(): any {
        return {}
    }
    _setAdditionalProperties(): any {
        return {}
    }
    _createCTimeMTime(): any {
        return {
            ctime: new Date(),
            mtime: new Date(),
        }
    }
    abstract _upsert(row: GitFileRow): Promise<void>
    abstract _delete(filepath: string, prematch: boolean): Promise<void>
    abstract _selectData(filepath: string): Promise<Buffer | null>
    abstract _selectMetaChild(dir: string): Promise<GitFileMeta[]>
    abstract _selectMeta(filepath: string): Promise<GitFileMeta | null>
}


export interface GitFileMeta {
    filepath: string,
    fileType: GitFileType,
    fileSize?: number,
    ctime?: Date,
    mtime?: Date,
}
export interface GitFileRow extends GitFileMeta {
    data?: Buffer,
}

function uniq(array: string[]) {
    return Array.from(new Set(array));
}