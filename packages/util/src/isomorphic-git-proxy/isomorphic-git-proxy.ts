
let isomorphicGitProxy:any

export function setIsomorphicGit(isomorphicGit:any) {
    isomorphicGitProxy = isomorphicGit
    init = isomorphicGitProxy.init
    add = isomorphicGitProxy.add
    commit = isomorphicGitProxy.commit
    listRefs = isomorphicGitProxy.listRefs
    writeObject = isomorphicGitProxy.writeObject
}


export let commit:any
export let add:any
export let init:any
export let listRefs:any
export let writeObject:any