import 'dotenv/config';

import http, { IncomingMessage, ServerResponse } from 'http'
import { createLogger } from './src/create-logger';
import { createGitServer, serveGitServer } from './src/setup-git-server';
import { sqlfs } from './src/setup-git-fs';
import fs from 'fs';

const logger = createLogger()
const USE_SQLFS = process.env["USE_SQLFS"] === 'true'
const usingFileSystem = USE_SQLFS ? sqlfs : fs
const gitServer = createGitServer(usingFileSystem)


export const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
	const url = new URL("http://localhost" + req.url!)
	logger.info(req.method + " " + url.pathname + "?" + url.search)
	await serveGitServer(req, res, gitServer)
})

server.listen(3000)
logger.info('start server port 3000')