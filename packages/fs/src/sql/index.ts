import cls from 'cls-hooked'
import { BaseFS, BaseFSOptions, GitFileMeta, GitFileRow } from "../base";

export const NAMESPACE_TRANSACTION_NAME = "transaction"

export interface RawSQLFSOptions extends BaseFSOptions {
    namespace?: cls.Namespace<Record<string, any>>;
}
export abstract class RawSQLFS extends BaseFS {
    namespace?: cls.Namespace<Record<string, any>>
    constructor(options: RawSQLFSOptions) {
        super(options)
        this.namespace = options.namespace
    }

    async _upsert(row: GitFileRow): Promise<void> {
        await this._executeQuery(
            "insert into files(filepath,data,file_type,file_size,ctime,mtime)"
            + " values($1,$2,$3,$4,$5,$6) on conflict(filepath) do update "
            + " set data=$7, file_type=$8, file_size=$9, mtime=$10",
            [row.filepath, row.data, row.fileType, row.fileSize, row.ctime, row.mtime
                , row.data, row.fileType, row.fileSize, row.mtime])
    }
    async _delete(filepath: string, prematch: boolean): Promise<void> {
        if (prematch) {
            await this._executeQuery("delete from files where filepath like $1", [`${filepath}/%`])
        } else {
            await this._executeQuery("delete from files where filepath=$1", [filepath])
        }
    }
    async _selectData(filepath: string): Promise<Buffer | null> {
        const resp = await this._executeQuery(`SELECT data from files where filepath = $1 limit 1`, [filepath]);

        const result = resp[0]
        if (result) {
            return result.data
        } else {
            return null
        }
    }
    async _selectMetaChild(dir: string): Promise<GitFileMeta[]> {
        const resp = await this._executeQuery(`SELECT filepath, file_type,file_size, ctime,mtime from files where filepath like $1`, [`${dir}/%`]);
        const result = resp.map((item: any) => {
            return {
                filepath: item.filepath,
                fileSize: item.file_size,
                fileType: item.file_type,
                ctime: item.ctime,
                mtime: item.mtime,
            }
        })
        return result
    }
    async _selectMeta(filepath: string): Promise<GitFileMeta | null> {
        const resp = await this._executeQuery(`SELECT file_type,ctime,mtime from files where (filepath = $1) or (filepath like $2) order by filepath limit 1`, [filepath, `${filepath}/%`]);
        const resultDir = resp[0]
        if (resultDir) {
            return {
                filepath: resultDir.filepath,
                fileSize: resultDir.file_size,
                fileType: resultDir.file_type,
                ctime: resultDir.ctime,
                mtime: resultDir.mtime,
            }
        }
        return null
    }
    async _executeQuery(_query: string, _params: ParamData[]): Promise<any> {

    }
}
export type ParamData = number | string | boolean | Date | Buffer | null | undefined | Buffer<ArrayBufferLike>