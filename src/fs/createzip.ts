import JSZip from "jszip";

import * as igit from "../util/isomorphic-git-proxy/isomofic-git-internal-proxy"

export async function createZip(_fs:any, dir:string) {
    const fs = new igit.FileSystem(_fs)
    const zip = new JSZip();
    await toZip(fs, dir, zip)
    return zip
}

async function toZip(fs:any, dir:string, folder:any) {
    const indirlist = await fs._readdir(dir)
    for (let fname of indirlist) {
        const filename = `${dir}/${fname}`
        const fstat = await fs._stat(filename)
        if (fstat.isDirectory()) {
            const childFolder = folder.folder(fname);
            await toZip(fs, filename, childFolder)
        } else {
            const data = await fs._readFile(filename)
            folder.file(fname, data)
        }
    }
}