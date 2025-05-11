import { startServer } from "../src/setup-test"
import dotenv from 'dotenv'
const config = dotenv.config().parsed;

import * as git from "isomorphic-git"
import http from "isomorphic-git/http/node"
import fs from 'fs';
import { namespace, sqlfs } from "../src/setup-git-fs";

const LOCAL_FS_PATH = "dist"

const author = {
    name: "test",
    email: "test@example.com"
}

test("receive_pack_test", async () => {
    await http.request({ url: `http://localhost:3000/init?repo=${getRepoName()}`, method: "POST" })
    await git.clone({ ...getDefaultParams() })
    fs.writeFileSync(LOCAL_FS_PATH + "/" + getRepoName() + "/edit/test.txt", "testdata")
    await git.add({ ...getDefaultParams(), filepath: "test.txt" })
    await git.commit({ ...getDefaultParams(), message: "add test", author })
    await git.push({ ...getDefaultParams() })
    await git.clone({
        ...getDefaultParams(),
        // url:"http://localhost:54321/functions/v1/git-server/funakigitserver_local",
        // url: "https://github.com/funkjk/testgitserver.git",
        // url:"https://github.com/funkjk/testgitserver_empty.git",
        // fs:sqlfs,
        dir: LOCAL_FS_PATH + "/" + getRepoName() + "/read",
    })
    const readText = fs.readFileSync(LOCAL_FS_PATH + "/" + getRepoName() + "/read/test.txt")
    expect(readText.toString("utf8")).toBe("testdata")


    fs.writeFileSync(LOCAL_FS_PATH + "/" + getRepoName() + "/edit/test.txt", "testdata update")
    await git.add({ ...getDefaultParams(), filepath: "test.txt" })
    await git.commit({ ...getDefaultParams(), message: "update test", author })
    await git.push({ ...getDefaultParams(), force: true })


    await git.pull({
        ...getDefaultParams(),
        dir: LOCAL_FS_PATH + "/" + getRepoName() + "/read",
        author
    })
    const updatedText = fs.readFileSync(LOCAL_FS_PATH + "/" + getRepoName() + "/read/test.txt")
    expect(updatedText.toString("utf8")).toBe("testdata update")



}, 30 * 1000)


let server: any
beforeEach(async () => {
    await cleanup();
});
beforeAll(async () => {
    fs.rmSync(LOCAL_FS_PATH, { recursive: true, force: true })
    fs.mkdirSync(LOCAL_FS_PATH)
    server = await startServer()
});
afterAll(async () => {
    await server.close()
});


async function cleanup() {
    await namespace.runPromise(async () => {
        namespace.set("repositoryId", "efe30e56-3e48-b8ef-5500-5941fb97ebe1")
        await sqlfs.rmdir("examples/repos/" + getRepoName())
    })
    fs.rmSync(LOCAL_FS_PATH + "/" + getRepoName(), { recursive: true, force: true })
}
function getRepoName() {
    return expect.getState().currentTestName
}
function getDefaultParams() {
    return {
        fs,
        // fs:sqlfs,
        remoteRef: "main",
        dir: LOCAL_FS_PATH + "/" + getRepoName() + "/edit",
        url: `http://localhost:3000/${getRepoName()}`,
        http
    }
}