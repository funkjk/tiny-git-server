
import { IncomingMessage } from 'http'
import { Readable } from 'stream';
import { ErrorType, GitServerError } from './GitServerError';


export enum GitService {
  GIT_UPLOAD_PACK = "git-upload-pack",
  GIT_RECEIVE_PACK = "git-receive-pack"
}

export enum RequestType {
  INFO_RES_UPLOAD = "INFO_RES_UPLOAD",
  INFO_RES_RECEIVE = "INFO_RES_RECEIVE",
  UPLOAD_PACK = "UPLOAD_PACK",
  RECEIVE_PACK = "RECEIVE_PACK",
  INIT = "INIT",
  OTHER = "OTHER"
}

export const REQUEST_TYPE_TO_SERVICE = {
  [RequestType.INFO_RES_RECEIVE]: GitService.GIT_RECEIVE_PACK,
  [RequestType.INFO_RES_UPLOAD]: GitService.GIT_UPLOAD_PACK,
  [RequestType.UPLOAD_PACK]: GitService.GIT_UPLOAD_PACK,
  [RequestType.RECEIVE_PACK]: GitService.GIT_RECEIVE_PACK,
  [RequestType.INIT]: null,
  [RequestType.OTHER]: null
}
export interface GitRequest {
  type: RequestType;
  repoName: string;
  requestData: Readable;
}

export interface GitServerResponse {
  response: Buffer
}

export function toGitRequest(args:
  { urlstring: string, method: string, requestData: Readable, pathPrefix?: string }): GitRequest {
  const { urlstring, method, requestData } = args
  const url = new URL(urlstring)
  const queryParamService = url.searchParams.get("service")
  const pathname = url.pathname
  let type = RequestType.OTHER
  let repoName = ""
  if (method === 'GET' && pathname?.endsWith('/info/refs')) {
    repoName = getRepoName(pathname, "/info/refs", args.pathPrefix)
    if (queryParamService === GitService.GIT_UPLOAD_PACK) {
      type = RequestType.INFO_RES_UPLOAD
    } else if (queryParamService === GitService.GIT_RECEIVE_PACK) {
      type = RequestType.INFO_RES_RECEIVE
    }
  } else if (method === 'POST' && pathname?.endsWith('git-upload-pack')) {
    type = RequestType.UPLOAD_PACK
    repoName = getRepoName(pathname, "/git-upload-pack", args.pathPrefix)
  } else if (method === 'POST' && pathname?.endsWith('git-receive-pack')) {
    type = RequestType.RECEIVE_PACK
    repoName = getRepoName(pathname, "/git-receive-pack", args.pathPrefix)
  }
  return {
    type,
    repoName,
    requestData
  }
}

function getRepoName(pathname: string, gitOperationName: string, pathPrefix?: string) {
  const prefix = pathPrefix ? pathPrefix : "/"
  if (!pathname.startsWith(prefix)) {
    throw new GitServerError(ErrorType.INVALID_PARAMETER, `pathname[${pathname}] not start pathPrefix[${prefix}]`)
  }
  const repoName = pathname.substring(prefix.length, pathname.length - gitOperationName.length)
  return repoName
}
export function toGitRequestFromIncomingMessage(req: IncomingMessage, pathPrefix?: string): GitRequest {
  return toGitRequest({
    urlstring: "http://localhost" + req.url,
    method: req.method!,
    requestData: req,
    pathPrefix
  })
}