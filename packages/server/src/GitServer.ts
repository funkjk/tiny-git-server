import { IncomingMessage, ServerResponse } from "http";


import * as igit from "@tiny-git-server/util"
import * as git from "@tiny-git-server/util"
import * as is from "./identity-request";
import { GitPktWrite, ObjectEntry } from "./GitPktWrite";
import { Readable } from "stream";
import { _listUploadObjects } from "./listUploadObjects";
import { DefaultLogging, LogLevel, Logging } from "@tiny-git-server/util"
import { ErrorType, GitServerError } from "./GitServerError";

const TYPE_NUMBDER: any = {}
TYPE_NUMBDER["commit"] = 1
TYPE_NUMBDER["tree"] = 2
TYPE_NUMBDER["blob"] = 3
TYPE_NUMBDER["tag"] = 4

const PackfileChannel = 1

const serviceType = {} as any
serviceType[is.RequestType.INFO_RES_RECEIVE] = is.GitService.GIT_RECEIVE_PACK
serviceType[is.RequestType.INFO_RES_UPLOAD] = is.GitService.GIT_UPLOAD_PACK
serviceType[is.RequestType.UPLOAD_PACK] = is.GitService.GIT_UPLOAD_PACK
serviceType[is.RequestType.RECEIVE_PACK] = is.GitService.GIT_RECEIVE_PACK

export class GitServer {
    fs: any;
    rootDir: string
    capabilities: string[]
    agentName: string
    logging: Logging;
    constructor(args: { fs: any, rootDir: string, logging?: Logging, capabilities?: string[] }) {
        this.fs = new igit.FileSystem(args.fs)
        this.rootDir = args.rootDir
        this.logging = args.logging ?? DefaultLogging
        this.capabilities = [
            // 'multi_ack',
            // 'thin-pack','side-band','side-band-64k','ofs-delta','shallow','deepen-since',
            // 'deepen-not','deepen-relative','no-progress','include-tag',
            // 'multi_ack_detailed', 'allow-tip-sha1-in-want', 'allow-reachable-sha1-in-want', 
            // 'no-done', 'filter'
            'side-band-64k',
            'no-done',
            // 'multi_ack_detailed',
            // ...(args.capabilities) ? args.capabilities : ['no-done', 'side-band-64k']
        ]
        this.agentName = "tiny-git"
    }
    async init(repoName: string, options?: any) {
        if (!repoName || repoName.length == 0) {
            throw new GitServerError(ErrorType.INVALID_PARAMETER, `invalid name length. repository [${repoName}]`)
        }
        if (!repoName.match("^[A-Za-z0-9_]+$")) {
            throw new GitServerError(ErrorType.INVALID_PARAMETER, `invalid name pattern. repository [${repoName}]`)
        }
        const gitdir = this._getGitDir(repoName)
        const exists = await this._repositoryExists(repoName)
        if (exists) {
            throw new GitServerError(ErrorType.NOT_FOUND, `repository [${repoName}] already exists`)
        }
        await git.init({ fs: this.fs, bare: true, gitdir, defaultBranch: "main" })
        this.logging(LogLevel.DEBUG, `repository [${repoName}] created`)
        if (options && options.addReadme) {
            // await this.fs.writeFile(this.rootDir + "/README.md", "")
            // await git.add({ fs: this.fs, gitdir, filepath: "README.md" })
            // await git.commit({
            //     fs: this.fs, gitdir, message: "init", author: {
            //         email: "init@example.com",
            //         name: "init"
            //     }
            // })
        }
    }

    async handle(gitRequest: is.GitRequest) {
        this.logging(LogLevel.INFO, `handle ${gitRequest.type} ${gitRequest.repoName}`)
        const handlers = {} as any
        handlers[is.RequestType.INFO_RES_RECEIVE] = this._infoRes
        handlers[is.RequestType.INFO_RES_UPLOAD] = this._infoRes
        handlers[is.RequestType.UPLOAD_PACK] = this._gitUploadPack
        handlers[is.RequestType.RECEIVE_PACK] = this._gitRecievePack
        if (!handlers[gitRequest.type]) {
            throw new GitServerError(ErrorType.NO_OPERATION, gitRequest.type)
        }
        const exists = await this._repositoryExists(gitRequest.repoName)
        if (!exists) {
            throw new GitServerError(ErrorType.NOT_FOUND, `repository [${gitRequest.repoName}] not found`)
        }
        const responseBuffer = await handlers[gitRequest.type].call(this, gitRequest)
        this.logging(LogLevel.SILLY, "response buff:" + responseBuffer.toString("hex"))
        return responseBuffer
    }
    async serve(req: IncomingMessage, res: ServerResponse) {
        const gitRequest = is.toGitRequestFromIncomingMessage(req)
        const service = serviceType[gitRequest.type]
        res.setHeader('Content-Type', `application/x-${service}-advertisement`)

        const responseBuffer = await this.handle(gitRequest)
        res.writeHead(200)
        res.write(responseBuffer)

        res.end();
    }
    async _infoRes(gitRequest: is.GitRequest) {
        const gitdir = this._getGitDir(gitRequest.repoName)
        const refs: Ref = {}
        const fs = this.fs
        const symrefs: Ref = {}

        const refsKeys = await git.listRefs({ fs, gitdir, filepath: "refs" })
        for (const ref of refsKeys) {
            let key = `refs/${ref}`
            refs[key] = await igit.GitRefManager.resolve({ fs, gitdir, ref: key })
        }
        let head = (await this.fs._readFile(`${gitdir}/HEAD`)).toString()
        if (head.startsWith("ref: ")) {
            // remove last new line
            head = head.substring("ref: ".length, head.length - 1)
        }
        if (refsKeys.length > 0) {
            refs["HEAD"] = await igit.GitRefManager.resolve({ fs, gitdir, ref: head })
        }
        const resStreams = writeRefsAdResponse({
            service: serviceType[gitRequest.type],
            capabilities: this.capabilities, agent: this.agentName,
            refs, symrefs
        })
        this.logging(LogLevel.DEBUG, "_infoRes return", { refs, symrefs })
        return Buffer.concat([resStreams, Buffer.from("0000")]) // use flush
    }
    async _gitUploadPack(gitRequest: is.GitRequest) {
        const gitdir = this._getGitDir(gitRequest.repoName)
        const fs = this.fs

        let target
        let loopIdx = 0
        const buff = await stream2buffer(gitRequest.requestData)
        const strm = Readable.from(buff)
        this.logging(LogLevel.SILLY, "request buff: " + buff.toString("hex"))

        target = await igit.parseUploadPackRequest(strm)
        loopIdx++
        const haveAckList: string[] = []
        this.logging(LogLevel.DEBUG, "_gitUploadPack request", target)
        for (let oid of target.haves) {
            try {
                await igit._readObject({ fs, gitdir, oid: oid })
                haveAckList.push(oid)
            } catch (e) {
                this.logging(LogLevel.WARN, "_readObject", e)
            }
        }
        this.logging(LogLevel.DEBUG, "_gitUploadPack haveAckList", haveAckList)
        let ackResponseBuffer = Buffer.concat(haveAckList.map(oid => Buffer.from(igit.GitPktLine.encode(`ACK ${oid} common\n`))))

        if (haveAckList.length > 0) {
            const oid = haveAckList[haveAckList.length - 1]
            const readyBuffer = igit.GitPktLine.encode(`ACK ${oid} ready\n`)
            const lastAckBuffer = igit.GitPktLine.encode(`ACK ${oid}\n`)
            ackResponseBuffer = Buffer.concat([ackResponseBuffer, readyBuffer, lastAckBuffer])
        }

        const uploadObjectList = await _listUploadObjects({ fs, gitdir, dir: gitdir, wantOids: target.wants, haveOids: target.haves })

        const objectsEntries: ObjectEntry[] = []
        for (let uploadObject of uploadObjectList) {
            objectsEntries.push({
                type: TYPE_NUMBDER[uploadObject.type],
                buffer: uploadObject.object
            })
        }
        this.logging(LogLevel.DEBUG, "_gitUploadPack response objects",
            uploadObjectList.map(e => { return { type: e.type, oid: e.oid } }))
        const packedStream = await GitPktWrite.write(objectsEntries)
        if (haveAckList.length > 0) {
            const responseBuffer = Buffer.concat([ackResponseBuffer, packedStream])
            return responseBuffer
        } else {
            const nak = "0008NAK\n"
            const responseBuffer = Buffer.concat([Buffer.from(nak), encodeSideBand(PackfileChannel, packedStream), Buffer.from("0000")])
            return responseBuffer
        }
    }
    async _gitRecievePack(gitRequest: is.GitRequest) {
        const gitdir = this._getGitDir(gitRequest.repoName)
        const fs = this.fs
        const responseBuffer: Buffer[] = []
        let capabilities: string[] = []

        for await (let buff of gitRequest.requestData) {
            this.logging(LogLevel.SILLY, "requestBuff:" + buff.toString("hex"))
            const stream = Readable.from(buff)
            // dont read direct by streamReader because cannot receive PACK line
            const read = await igit.GitPktLine.streamReader(stream)
            let lineBuffer = await read()
            const triplets: any[] = []
            let readedLength = 0
            const READ_SIZE_BYTE = 4 // 4 is size byte
            while (lineBuffer !== null) {
                readedLength += lineBuffer.length + READ_SIZE_BYTE
                const lineStr = lineBuffer.toString("utf8")
                const lineData = lineStr.replace("\x00", "").split(" ")
                const [oldoid, oid, fullRef] = lineData
                if (lineData.slice(3, lineData.length - 1).length > 0) {
                    capabilities = lineData.slice(3, lineData.length - 1)
                }
                triplets.push({ oldoid, oid, fullRef })
                lineBuffer = await read()
            }
            this.logging(LogLevel.DEBUG, "_gitRecievePack capabilities", capabilities)

            const getExternalRefDelta = async function (oid: string) {
                const { type, object } = await igit._readObject({ fs, gitdir, oid })
                return { type, format: 'content', object }
            }

            const packbuffer = buff.slice(readedLength + 4)
            const packedData = await igit.GitPackIndex.fromPack({ pack: packbuffer, getExternalRefDelta })

            for (let oid of packedData.hashes) {
                const obj = await packedData.read({ oid })
                await git.writeObject({ fs, gitdir, type: obj.type, object: obj.object })
            }

            this.logging(LogLevel.DEBUG, "_gitRecievePack triplets", triplets)
            for (let triplet of triplets) {
                if ("0000000000000000000000000000000000000000" != triplet.oldoid) {
                    const currentOid = await igit.GitRefManager.resolve({ fs, gitdir, ref: triplet.fullRef })
                    if (currentOid !== triplet.oldoid) {
                        responseBuffer.push(igit.GitPktLine.encode(`ng ${triplet.fullRef} conflict\n`))
                        break;
                    }
                }
                await igit.GitRefManager.writeRef({ fs, gitdir, ref: triplet.fullRef, value: triplet.oid })
                responseBuffer.push(igit.GitPktLine.encode(`ok ${triplet.fullRef}\n`))
            }

            responseBuffer.push(igit.GitPktLine.encode(`unpack ok\n`))
        }

        if (capabilities.includes("side-band-64k")) {
            const response = Buffer.concat(responseBuffer.reverse().map(
                e => encodeSideBand(PackfileChannel, e)));
            return response
        } else {
            return Buffer.concat([])
        }
    }
    async _repositoryExists(repoName: string) {
        const gitdir = this._getGitDir(repoName)
        const filepath = gitdir + "/config"
        return await this.fs.exists(filepath)
    }
    _getGitDir(repoName: string): string {
        return this.rootDir + "/" + repoName
    }
}
function encodeSideBand(channel: number, line: string | Buffer) {
    if (typeof line === 'string') {
        line = Buffer.from(line)
    }
    const length = line.length + 4 + 1
    const hexlength = igit.padHex(4, length)

    return Buffer.concat([Buffer.from(hexlength, 'utf8'), Buffer.from([channel]), line])
}


type Ref = { [key: string]: string }
function writeRefsAdResponse(args: { service: string, capabilities: string[], refs: Ref, symrefs: Ref, agent: string }): Buffer {
    const stream: string[] = []
    stream.push(igit.GitPktLine.encode(`# service=${args.service}\n`))
    stream.push("0000")
    let capabilities = [...args.capabilities]
    const syms = Object.entries(args.symrefs).map(e => `symref=${e[0]}:${e[1]}`).join(" ")
    let caps = `\x00${capabilities.join(' ')} ${syms}object-format=sha1 agent=${args.agent}`
    if (Object.entries(args.refs).length == 0) {
        args.refs["capabilities^{}"] = "0000000000000000000000000000000000000000"
    }
    for (const [key, value] of Object.entries(args.refs)) {
        stream.push(igit.GitPktLine.encode(`${value} ${key}${caps}\n`))
        // add only first ref line
        caps = ''
    }

    return Buffer.from(stream.join(""), "utf8")
}

function stream2buffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const _buf: Buffer[] = [];
        stream.on("data", (chunk) => _buf.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(_buf)));
        stream.on("error", (err) => reject(err));
    });
} 