import dotenv from 'dotenv'
const config = dotenv.config().parsed;

import { setIsomorphicGit,setIsomorphicGitInternal } from '@tiny-git-server/util';

// //@ts-ignore
// import * as igit from "isomorphic-git/internal-apis"
import * as git from "isomorphic-git"

//@ts-ignore
import * as igit from "../../../isomorphic-git/internal-apis.cjs"
//@ts-ignore
// import * as git from "../../../isomorphic-git/index.cjs"

setIsomorphicGitInternal(igit)
setIsomorphicGit(git)


import http, { IncomingMessage, ServerResponse } from 'http'
import { serveGitServer } from './setup-git-server';


export async function startServer() {
    const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
        const url = new URL("http://localhost" + req.url!)
        await serveGitServer(req, res)
    })

    server.listen(3000)
    return server
}



test("check", async () => {
})