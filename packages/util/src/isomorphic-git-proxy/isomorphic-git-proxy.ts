
let isomorphicGitProxy:any

export function setIsomorphicGit(isomorphicGit:any) {
    isomorphicGitProxy = isomorphicGit
    init = isomorphicGitProxy.init
    listRefs = isomorphicGitProxy.listRefs
    writeObject = isomorphicGitProxy.writeObject
}


export let init:any
export let listRefs:any
export let writeObject:any