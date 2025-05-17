import { LogLevel } from "@funkjk/tiny-git-server-util";

export const NAMESPACE_TRANSACTION_NAME = "transaction"
import { Client } from 'pg'
import { ParamData, RawSQLFS, RawSQLFSOptions } from "..";

export interface PgSQLFSOptions extends RawSQLFSOptions {
    client: Client;
}
export class PgSQLFS extends RawSQLFS {
    client: Client
    constructor(options: PgSQLFSOptions) {
        super(options)
        this.client = options.client
    }

    async _executeQuery(query: string, params: ParamData[]): Promise<any> {
        try {
            const res = await this.client.query(query, params)
            return res;
        } catch (err) {
            this.logging(LogLevel.ERROR, "Error executing query:", err)
            throw err;
        }
    }
}