import { serveGitServer } from "./setup-git-server.ts"
import { createLogger } from "./create-logger.ts"

export async function handler(request: Request): Promise<Response> {
    logger.info(request.method + " " + request.url)
    return serveGitServer(request)
}


const logger = createLogger()
