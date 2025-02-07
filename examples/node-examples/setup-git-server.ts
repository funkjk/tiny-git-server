import { IncomingMessage, ServerResponse } from 'http'
import { GitServer } from 'tiny-git-server/server';
import { gitServerLogging } from './create-logger';
import { sqlfs } from './setup-git-fs';

const ROOT_DIR = "examples/repos"


const fs = sqlfs

export const gitServer = new GitServer({ fs: fs, rootDir: ROOT_DIR, logging: gitServerLogging })

export const serveGitServer = async function (req: IncomingMessage, res: ServerResponse) {

    const url = new URL("http://localhost" + req.url!)
    const pathname = url.pathname
    if (pathname == "/init" && req.method == "POST") {
        const repo = url.searchParams.get("repo")
        await gitServer.init(repo!)
        res.writeHead(201)
        res.end()
    } else {
        await gitServer.serve(req, res)
    }
}