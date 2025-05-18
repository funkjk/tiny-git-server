import dotenv from 'dotenv'
dotenv.config().parsed;
import * as git from "@funkjk/isomorphic-git"
import http from "@funkjk/isomorphic-git/http/node"
import fs from 'fs';
import { namespace, sqlfs } from "../src/setup-git-fs";
import { cleanup, doIsomorphicGitTest, getRepoName, startServer } from "../src/setup-test"

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
    server = await startServer(sqlfs)
});
afterAll(async () => {
    await server.close()
});

