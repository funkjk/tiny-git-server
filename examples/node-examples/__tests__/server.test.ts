import { startServer } from "../src/setup-test"
import * as git from "isomorphic-git"
import http from "isomorphic-git/http/node"
import fs from 'fs';
import { namespace, sequelize, sqlfs } from "../src/setup-git-fs";

const LOCAL_FS_PATH = "./dist"

const author = {
    name: "test",
    email: "test@example.com"
}
test("receive_pack", async () => {
    await http.request({ url: `http://localhost:3000/init?repo=${getRepoName()}`, method: "POST" })
    await git.clone({ ...getDefaultParams() })
    const branch = await git.branch({ ...getDefaultParams(), ref: "main" })
    console.log("branch", branch)
    fs.writeFileSync(LOCAL_FS_PATH + "/" + getRepoName() + "/edit/test.txt", "testdata")
    await git.add({ ...getDefaultParams(), filepath: "test.txt" })
    await git.commit({ ...getDefaultParams(), message: "add test", author })
    await git.push({ ...getDefaultParams(), force: true })
    await git.clone({
        ...getDefaultParams(),
        dir: LOCAL_FS_PATH + "/" + getRepoName() + "/read"
    })

})

test("init_with_addReadme", async () => {

    await http.request({ url: `http://localhost:3000/init?repo=${getRepoName()}&addReadme=true`, method: "POST" })
    await git.clone(getDefaultParams())

})

let server: any
beforeEach(async () => {
    await cleanup();
});
beforeAll(async () => {
    if (!fs.existsSync(LOCAL_FS_PATH)) {
        fs.mkdirSync(LOCAL_FS_PATH)
    }
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
        remoteRef: "main",
        dir: LOCAL_FS_PATH + "/" + getRepoName() + "/edit",
        url: `http://localhost:3000/${getRepoName()}`,
        http
    }
}