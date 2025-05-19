import dotenv from 'dotenv'
dotenv.config().parsed;
import fs from 'fs';
import { namespace } from "../../src/setup-git-fs";
import { cleanup, doIsomorphicGitTest, getRepoName, startServer } from "../../src/setup-test"
import { PgSQLFS } from "../../../../packages/fs/src/sql/pg"
import { sqlfsLogging } from '../../src/create-logger';
import { Client } from 'pg';
import { LOCAL_FS_ROOT_DIR } from '../../src/setup-git-server';

const LOCAL_FS_PATH = "dist"


test("pg-fs", async () => {
    await doIsomorphicGitTest(getRepoName())
}, 30 * 1000)


let server: any
beforeEach(async () => {
    await cleanup(getRepoName());
});
beforeAll(async () => {
    fs.rmSync(LOCAL_FS_PATH, { recursive: true, force: true })
    fs.mkdirSync(LOCAL_FS_PATH)
    server = await startServer(pgsqlfs)
    client.connect()
});
afterAll(async () => {
    await server.close()
    await client.end()
});



const client = new Client({
    connectionString: process.env.DATABASE_URL,
})
const pgsqlfs = new PgSQLFS({
    rootDir: LOCAL_FS_ROOT_DIR,
    logging: sqlfsLogging, namespace, client
})