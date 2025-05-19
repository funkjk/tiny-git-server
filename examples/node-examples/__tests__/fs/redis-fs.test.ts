import dotenv from 'dotenv'
dotenv.config().parsed;
import fs from 'fs';
import { createClient, RedisClientType } from 'redis';
import { cleanup, doIsomorphicGitTest, getRepoName, startServer } from "../../src/setup-test"
import { RedisFS } from "../../../../packages/fs/src/redisfs"
import { sqlfsLogging } from '../../src/create-logger';
import { LOCAL_FS_ROOT_DIR } from '../../src/setup-git-server';

const LOCAL_FS_PATH = "dist"


test("redis-fs", async () => {
    await doIsomorphicGitTest(getRepoName())
}, 30 * 1000)


let server: any
beforeEach(async () => {
    await cleanup(getRepoName());
});
beforeAll(async () => {
    fs.rmSync(LOCAL_FS_PATH, { recursive: true, force: true })
    fs.mkdirSync(LOCAL_FS_PATH)
    server = await startServer(redisfs)
    client.connect()
    const keys = await client.keys("*")
    for (const key of keys) {
        if (key.search(getRepoName()) !== -1) {
            await client.del(key)
        }
    }
});
afterAll(async () => {
    await server.close()
    await client.quit()
});



const client = createClient() as RedisClientType
const redisfs = new RedisFS({
    rootDir: LOCAL_FS_ROOT_DIR,
    logging: sqlfsLogging,
    client
})