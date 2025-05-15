import dotenv from 'dotenv'
dotenv.config().parsed;

import http, { IncomingMessage, ServerResponse } from 'http'
import { serveGitServer } from '../src/setup-git-server';


export async function startServer() {
    const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
        await serveGitServer(req, res)
    })

    server.listen(3000)
    return server
}