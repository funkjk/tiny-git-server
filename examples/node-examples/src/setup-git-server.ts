import { IncomingMessage, ServerResponse } from 'http'
import { GitServer } from '../../../packages/server/src';
import { createZip } from '@funkjk/tiny-git-server-util';
import { createLogger, gitServerLogging } from './create-logger';
import { sqlfs } from './setup-git-fs';


import { namespace, sequelize } from './setup-git-fs';
import { ErrorType, HTTP_STATUS_BY_ERROR } from '../../../packages/server/src';
import { NAMESPACE_TRANSACTION_NAME } from '../../../packages/fs/src';

import * as fs from "fs"

const ROOT_DIR = "dist/repos"
const logger = createLogger()
const USE_SQLFS = process.env["USE_SQLFS"] === 'true'
const usingFileSystem = USE_SQLFS ? sqlfs : fs
logger.info("usingFileSystem:" + (USE_SQLFS ? "sqlfs url=" + process.env.DATABASE_URL : "localFileSystem path=" + ROOT_DIR))

export const gitServer = new GitServer({ fs: usingFileSystem, rootDir: ROOT_DIR, logging: gitServerLogging })

export const serveGitServer = async function (req: IncomingMessage, res: ServerResponse) {
    await withTx(req, res)
}
const withTx = async function (req: IncomingMessage, res: ServerResponse) {

    await namespace.runPromise(async () => {
        const tx = await sequelize.transaction()
        namespace.set(NAMESPACE_TRANSACTION_NAME, tx)
        namespace.set("repositoryId", "efe30e56-3e48-b8ef-5500-5941fb97ebe1")
        try {
            await gitServe(req, res)
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
                res.writeHead(500)
                throw e
            }
            res.end()
        }
    })
}
const gitServe = async function (req: IncomingMessage, res: ServerResponse) {
    const url = new URL("http://localhost" + req.url!)
    const pathname = url.pathname
    if (pathname == "/init" && req.method == "POST") {
        const repo = url.searchParams.get("repo")
        const addReadme = url.searchParams.get("addReadme")
        await gitServer.init(repo!, { addReadme: !!addReadme })
        res.writeHead(201)
        res.end()
    } else if (pathname == "/download") {
        const repo = url.searchParams.get("repo")
        const zipped = await createZip(usingFileSystem, ROOT_DIR + "/" + repo)
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
    logger.info("END:" + url)
}