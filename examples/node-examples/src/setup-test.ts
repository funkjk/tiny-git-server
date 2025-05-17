import dotenv from 'dotenv'
dotenv.config().parsed;

import http, { IncomingMessage, ServerResponse } from 'http'
import { createGitServer, serveGitServer } from '../src/setup-git-server';



export async function startServer(usingFileSystem: any) {
    const gitServer = await createGitServer(usingFileSystem)
    const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
        await serveGitServer(req, res, gitServer)
    })

    server.listen(3000)
    return server
}