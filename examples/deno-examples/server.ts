
import '../node-examples/isomofic-git-proxy'

import 'dotenv/config';

import { serveGitServer } from "./setup-git-server"
import { createLogger } from '../node-examples/create-logger';
import { ErrorType, HTTP_STATUS_BY_ERROR } from '../../dist';
import { sequelize } from '../node-examples/setup-git-fs';

const logger = createLogger()

async function handler(request: Request): Promise<Response> {
    logger.info(request.method + " " + request.url)
    const tx = await sequelize.transaction()
    try {
        const response = await serveGitServer(request)
        tx.commit()
        return response
    } catch (e: any) {
        tx.rollback()
        if (HTTP_STATUS_BY_ERROR[e.type as ErrorType]) {
            logger.info("END with error", e)
            const httpStatus = HTTP_STATUS_BY_ERROR[e.type as ErrorType] as number
            return new Response(e.message, { status: httpStatus })
        } else {
            logger.error(e)
            return new Response("", { status: 500 })
        }
    }
}

Deno.serve({ port: 3000 }, handler)
