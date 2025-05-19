import { RedisClientType } from 'redis';
import { BaseFS, BaseFSOptions, GitFileMeta, GitFileRow } from "../base";

export const NAMESPACE_TRANSACTION_NAME = "transaction"

export interface RedisFSOptions extends BaseFSOptions {
    client: RedisClientType
}
export class RedisFS extends BaseFS {
    client: RedisClientType;
    constructor(options: RedisFSOptions) {
        super(options)
        this.client = options.client
    }
    async getPreMatchFilepath(filepath: string): Promise<string[]> {
        const resp = await this.client.sMembers("idx:filepaths:" + this.getRepositoryName(filepath))
        const result = resp.filter((item: string) => {
            return item.startsWith(filepath + "/")
        })
        return result
    }
    async _upsert(row: GitFileRow): Promise<void> {
        await this.client.json.set("idx:files:" + row.filepath, "$", {
            filepath: row.filepath,
            data: row.data?.toString('base64') ?? null,
            fileType: row.fileType,
            fileSize: row.fileSize ?? null,
            ctime: row.ctime ?? null,
            mtime: row.mtime ?? null
        })
        const repositoryName = this.getRepositoryName(row.filepath)
        await this.client.sAdd("idx:filepaths:" + this.getRepositoryName(row.filepath), row.filepath)
    }
    async _delete(filepath: string, prematch: boolean): Promise<void> {
        if (prematch) {
            const filepaths = await this.getPreMatchFilepath(filepath)
            await filepaths.map(async (item) => {
                await this.client.json.del("idx:files:" + item)
            })
            await this.client.sRem("idx:filepaths:" + this.getRepositoryName(filepath), filepaths)
        } else {
            await this.client.json.del("idx:files:" + filepath)
            await this.client.sRem("idx:filepaths:" + this.getRepositoryName(filepath), filepath)
        }
    }
    async _selectData(filepath: string): Promise<Buffer | null> {
        const resp = await this.client.json.get("idx:files:" + filepath, { path: "$..data" })
        if (resp) {
            return Buffer.from(resp as string, 'base64')
        } else {
            return null
        }
    }
    async _selectMetaChild(dir: string): Promise<GitFileMeta[]> {
        const filepaths = await this.getPreMatchFilepath(dir)
        console.log("_selectMetaChild filepaths", filepaths)
        const result = [] as GitFileMeta[]
        for (const filepath of filepaths) {
            const resp = await this._selectMeta(filepath)
            result.push(resp as GitFileMeta)
        }
        console.log("_selectMetaChild result", result)
        return result
    }
    async _selectMeta(filepath: string): Promise<GitFileMeta | null> {
        const resp = await this.client.json.get("idx:files:" + filepath, { path: "$" })
        if (resp) {
            const result = JSON.parse(resp as string)
            return {
                filepath: result[0].filepath,
                fileSize: result[0].fileSize,
                fileType: result[0].fileType,
                ctime: result[0].ctime,
                mtime: result[0].mtime
            }
        } else {
            return null
        }
    }
}
export type ParamData = number | string | boolean | Date | Buffer | null | undefined | Buffer<ArrayBufferLike>