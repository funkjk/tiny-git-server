import 'dotenv/config';


import './isomofic-git-proxy'

import http, { IncomingMessage, ServerResponse } from 'http'
import { serveGitServer } from './setup-git-server';
import { createLogger } from './create-logger';
import { namespace, sequelize } from './setup-git-fs';
import { ErrorType, HTTP_STATUS_BY_ERROR, NAMESPACE_TRANSACTION_NAME } from 'tiny-git-server';

const logger = createLogger()


const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
	const url = new URL("http://localhost" + req.url!)
	logger.info(req.method + " " + url.pathname + "?" + url.search)
	await namespace.runPromise(async () => {
		const tx = await sequelize.transaction()
		namespace.set(NAMESPACE_TRANSACTION_NAME, tx)
		try {
			await serveGitServer(req, res)
			await tx.commit()
			logger.info("END")

		} catch (e: any) {
			await tx.rollback()
			if (HTTP_STATUS_BY_ERROR[e.type as ErrorType]) {
				logger.info("END with error", e)
				res.writeHead(HTTP_STATUS_BY_ERROR[e.type as ErrorType])
				res.write(e.message)
			} else {
				logger.error(e)
				res.write(500)
			}
			res.end()
		}
	})
})

server.listen(3000)
logger.info('start server port 3000', { test: "test" })