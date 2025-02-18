import * as igit from "@tiny-git-server/util"

export interface UploadObjectsList {
  oid: string, type: string, object: any
}

export async function _listUploadObjects(args: {
  fs: any,
  cache?: any,
  dir: string,
  gitdir: string,
  wantOids: string[],
  haveOids: string[],
}): Promise<UploadObjectsList[]> {
  const uploadTargetObject: { oid: string, type: string, object: any }[] = []
  const visited = new Set()
  args.haveOids.every(e => visited.add(e))
  async function walk(oid: string) {
    try {
      if (visited.has(oid)) return
      visited.add(oid)
      const { type, object } = await igit._readObject({ fs: args.fs, chache: args.cache, gitdir: args.gitdir, oid })
      uploadTargetObject.push({ oid, type, object })
      if (type === 'tag') {
        const tag = igit.GitAnnotatedTag.from(object)
        const obj = tag.headers().object
        await walk(obj)
      } else if (type === 'commit') {
        const commit = igit.GitCommit.from(object)
        await walk(commit.headers().tree)
        for (let parent of commit.headers().parent) {
          await walk(parent)
        }
      } else if (type === 'tree') {
        const tree = igit.GitTree.from(object)
        for (const entry of tree) {
          if (entry.type === 'blob') {
            await walk(entry.oid)
          }
          if (entry.type === 'tree') {
            await walk(entry.oid)
          }
        }
      } else if (type === 'blob') {
        // nop
      }
    } catch (e) {
      console.warn("_listUploadObjects", e) // TODO use logging
    }

  }
  for (const oid of args.wantOids) {
    await walk(oid)
  }
  return uploadTargetObject
}
