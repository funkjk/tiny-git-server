import dotenv from 'dotenv'
dotenv.config().parsed;
import fs from 'fs';
import { sqlfs } from "../../src/setup-git-fs";
import { cleanup, doIsomorphicGitTest, getRepoName, startServer } from "../../src/setup-test"

const LOCAL_FS_PATH = "dist"


test("supabase-fs", async () => {
    await doIsomorphicGitTest(getRepoName())
}, 30 * 1000)


let server: any
beforeEach(async () => {
    await cleanup(getRepoName());
});
beforeAll(async () => {
    fs.rmSync(LOCAL_FS_PATH, { recursive: true, force: true })
    fs.mkdirSync(LOCAL_FS_PATH)
    await sqlfs.rmdir(LOCAL_FS_PATH+"/" + getRepoName())
    server = await startServer(sqlfs)
});
afterAll(async () => {
    await server.close()
});

