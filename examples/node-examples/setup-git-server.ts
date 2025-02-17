import { IncomingMessage, ServerResponse } from 'http'
import { createZip, GitServer } from 'tiny-git-server';
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
    } else if (pathname == "/download") {
        const repo = url.searchParams.get("repo")
        const zipped = await createZip(fs, ROOT_DIR + "/" + repo)
        const data = await zipped.generateAsync({ type: "uint8array" });
        const filename = `${repo}_${new Date().toISOString()}.zip`
        res.writeHead(200, "", {
            "Content-Disposition": `attachment; filename=\"${filename}\"`
        })
        res.write(Buffer.from(data))
        res.end()
    } else {
        await gitServer.serve(req, res)
    }
}