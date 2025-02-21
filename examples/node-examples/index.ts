import 'dotenv/config';


import './isomorphic-git-proxy'

import http, { IncomingMessage, ServerResponse } from 'http'
import { createLogger } from './create-logger';
import { serveGitServer } from './setup-git-server';

const logger = createLogger()

const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
	const url = new URL("http://localhost" + req.url!)
	logger.info(req.method + " " + url.pathname + "?" + url.search)
	await serveGitServer(req, res)
})

server.listen(3000)
logger.info('start server port 3000', { test: "test" })