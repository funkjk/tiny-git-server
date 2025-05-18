import dotenv from 'dotenv'
dotenv.config().parsed;

import http, { IncomingMessage, ServerResponse } from 'http'
import gitHttp from "@funkjk/isomorphic-git/http/node"
import { createGitServer, serveGitServer } from '../src/setup-git-server';
import fs from 'fs';
import { LOCAL_FS_ROOT_DIR } from "../src/setup-git-server";
import * as git from "@funkjk/isomorphic-git"

const LOCAL_FS_PATH = "dist"

export async function startServer(usingFileSystem: any) {
    const gitServer = await createGitServer(usingFileSystem)
    const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
        await serveGitServer(req, res, gitServer)
    })

    server.listen(3000)
    return server
}

export async function doIsomorphicGitTest(
    gitRepoName: string
) {
    await fetch(`http://localhost:3000/init?repo=${gitRepoName}`, {method: "POST" })
    await git.clone({ ...getDefaultParams(gitRepoName) })
    fs.writeFileSync(LOCAL_FS_PATH + "/" + gitRepoName + "/edit/test.txt", "testdata")
    await git.add({ ...getDefaultParams(gitRepoName), filepath: "test.txt" })
    await git.commit({ ...getDefaultParams(gitRepoName), message: "add test", author })
    await git.push({ ...getDefaultParams(gitRepoName) })
    
    await git.clone({
        ...getDefaultParams(gitRepoName),
        dir: LOCAL_FS_PATH + "/" + gitRepoName + "/read",
    })
    const readText = fs.readFileSync(LOCAL_FS_PATH + "/" + gitRepoName + "/read/test.txt")
    expect(readText.toString("utf8")).toBe("testdata")


    fs.writeFileSync(LOCAL_FS_PATH + "/" + gitRepoName + "/edit/test.txt", "testdata update")
    await git.add({ ...getDefaultParams(gitRepoName), filepath: "test.txt" })
    await git.commit({ ...getDefaultParams(gitRepoName), message: "update test", author })
    await git.push({ ...getDefaultParams(gitRepoName), force: true })

    await git.pull({
        ...getDefaultParams(gitRepoName),
        dir: LOCAL_FS_PATH + "/" + gitRepoName + "/read",
        author
    })
    const updatedText = fs.readFileSync(LOCAL_FS_PATH + "/" + gitRepoName + "/read/test.txt")
    expect(updatedText.toString("utf8")).toBe("testdata update")
}

const author = {
    name: "test",
    email: "test@example.com"
}

function getDefaultParams(
    gitRepoName: string) {
    return {
        fs,
        remoteRef: "main",
        dir: LOCAL_FS_PATH + "/" + gitRepoName + "/edit",
        url: `http://localhost:3000/${gitRepoName}`,
        http:gitHttp
    }
}
export async function cleanup(reponame:string){
    fs.rmSync(LOCAL_FS_ROOT_DIR+"/"+reponame, { recursive: true, force: true })
    fs.rmSync(LOCAL_FS_PATH + "/" + reponame, { recursive: true, force: true })
}

export function getRepoName() {
    return expect.getState().currentTestName as string
}