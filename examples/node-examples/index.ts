import 'dotenv/config';

import http, { IncomingMessage, ServerResponse } from 'http'
import { createLogger } from './src/create-logger';
import { serveGitServer } from './src/setup-git-server';

const logger = createLogger()

export const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
	const url = new URL("http://localhost" + req.url!)
	logger.info(req.method + " " + url.pathname + "?" + url.search)
	await serveGitServer(req, res)
})

server.listen(3000)
logger.info('start server port 3000')
