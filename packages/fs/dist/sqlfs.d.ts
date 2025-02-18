import { Logging } from "@tiny-git-server/util";
export declare enum GitFileType {
    DIR = "DIR",
    FILE = "FILE"
}
export declare abstract class SQLFS {
    logging: Logging;
    constructor(options: {
        logging?: Logging;
    });
    readFile(filepath: string, encoding: any): Promise<any>;
    writeFile(filepath: string, content: Buffer | string): Promise<void>;
    unlink(filepath: string): Promise<void>;
    readdir(dir: string): Promise<string[]>;
    mkdir(dir: string): Promise<void>;
    rmdir(dir: string): Promise<void>;
    stat(filepath: string): Promise<{
        isDirectory: () => boolean;
        isFile: () => boolean;
        isSymbolicLink: () => boolean;
    }>;
    lstat(filepath: string): Promise<{
        isDirectory: () => boolean;
        isFile: () => boolean;
    }>;
    readlink(_filepath: string): Promise<void>;
    symlink(_target: string, _filepath: string): Promise<void>;
    _getAdditionalCondition(): any;
    _setAdditionalProperties(): any;
    _createCTimeMTime(): any;
    abstract _upsert(row: SqlRow): Promise<void>;
    abstract _delete(filepath: string, prematch: boolean): Promise<void>;
    abstract _selectData(filepath: string): Promise<Buffer | null>;
    abstract _selectMetaChild(dir: string): Promise<SqlMeta[]>;
    abstract _selectMeta(filepath: string): Promise<SqlMeta | null>;
}
export interface SqlMeta {
    filepath: string;
    fileType: GitFileType;
    fileSize?: number;
    ctime?: Date;
    mtime?: Date;
}
export interface SqlRow extends SqlMeta {
    data?: Buffer;
}
