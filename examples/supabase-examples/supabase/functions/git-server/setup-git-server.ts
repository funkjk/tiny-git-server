import { GitServer, toGitRequest, REQUEST_TYPE_TO_SERVICE } from 'tiny-git-server/server';

import { Readable } from "node:stream"
import { gitServerLogging } from './create-logger.ts';
import { sqlfs } from './setup-git-fs.ts';

const ROOT_DIR = "examples/repos"


const fs = sqlfs

export const gitServer = new GitServer({ fs: fs, rootDir: ROOT_DIR, logging: gitServerLogging })

export const serveGitServer = async function (request: Request): Promise<Response> {
    const url = new URL(request.url!)
    const pathname = url.pathname
    if (pathname.endsWith("/init") && request.method == "POST") {
        const repo = url.searchParams.get("repo")
        await gitServer.init(repo!)
        return new Response("", { status: 201 })
    } else {
        //@ts-ignore
        const requestData = (request.body) ? Readable.fromWeb(request.body!) : new Readable()
        const gitRequest = toGitRequest({
            urlstring: request.url!,
            method: request.method,
            requestData,
            pathPrefix: "/git-server/"
        })
        const responseBuffer = await gitServer.handle(gitRequest)
        const service = REQUEST_TYPE_TO_SERVICE[gitRequest.type]
        return new Response(responseBuffer, {
            headers: {
                "content-type": `application/x-${service}-advertisement`
            }, status: 200
        })
    }
}
