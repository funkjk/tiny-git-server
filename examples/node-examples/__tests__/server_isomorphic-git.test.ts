import { cleanup, doIsomorphicGitTest, getRepoName, startServer } from "../src/setup-test"
import dotenv from 'dotenv'
dotenv.config().parsed;
import fs from 'fs';

const LOCAL_FS_PATH = "dist"


test("isomorphic-git", async () => {
    await doIsomorphicGitTest(getRepoName())
}, 30 * 1000)


let server: any
beforeEach(async () => {
    await cleanup(getRepoName());
});
beforeAll(async () => {
    fs.rmSync(LOCAL_FS_PATH, { recursive: true, force: true })
    fs.mkdirSync(LOCAL_FS_PATH)
    server = await startServer(fs)
});
afterAll(async () => {
    await server.close()
});
