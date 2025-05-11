let isomorphicGitInternalProxy: any

export function setIsomorphicGitInternal(isomorphicGitInternal: any) {
    isomorphicGitInternalProxy = isomorphicGitInternal
    FileSystem = isomorphicGitInternalProxy.FileSystem
    GitRefManager = isomorphicGitInternalProxy.GitRefManager
    parseUploadPackRequest = isomorphicGitInternalProxy.parseUploadPackRequest
    _readObject = isomorphicGitInternalProxy._readObject
    GitPktLine = isomorphicGitInternalProxy.GitPktLine
    GitPackIndex = isomorphicGitInternalProxy.GitPackIndex
    padHex = isomorphicGitInternalProxy.padHex
    GitCommit = isomorphicGitInternalProxy.GitCommit
    GitTree = isomorphicGitInternalProxy.GitTree
    GitAnnotatedTag = isomorphicGitInternalProxy.GitAnnotatedTag
}


export let FileSystem:any
export let GitRefManager:any
export let parseUploadPackRequest:any
export let _readObject:any
export let GitPktLine:any
export let GitPackIndex:any
export let padHex:any
export let GitCommit:any
export let GitTree:any
export let GitAnnotatedTag:any

