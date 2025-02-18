let isomorphicGitProxy;
function setIsomorphicGit(isomorphicGit) {
    isomorphicGitProxy = isomorphicGit;
    init = isomorphicGitProxy.init;
    listRefs = isomorphicGitProxy.listRefs;
    writeObject = isomorphicGitProxy.writeObject;
}
let init;
let listRefs;
let writeObject;

let isomorphicGitInternalProxy;
function setIsomorphicGitInternal(isomorphicGitInternal) {
    isomorphicGitInternalProxy = isomorphicGitInternal;
    FileSystem = isomorphicGitInternalProxy.FileSystem;
    GitRefManager = isomorphicGitInternalProxy.GitRefManager;
    parseUploadPackRequest = isomorphicGitInternalProxy.parseUploadPackRequest;
    _readObject = isomorphicGitInternalProxy._readObject;
    GitPktLine = isomorphicGitInternalProxy.GitPktLine;
    GitPackIndex = isomorphicGitInternalProxy.GitPackIndex;
    padHex = isomorphicGitInternalProxy.padHex;
    GitCommit = isomorphicGitInternalProxy.GitCommit;
    GitTree = isomorphicGitInternalProxy.GitTree;
    GitAnnotatedTag = isomorphicGitInternalProxy.GitAnnotatedTag;
}
let FileSystem;
let GitRefManager;
let parseUploadPackRequest;
let _readObject;
let GitPktLine;
let GitPackIndex;
let padHex;
let GitCommit;
let GitTree;
let GitAnnotatedTag;

var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
})(LogLevel || (LogLevel = {}));
const DefaultLogging = (level, message, ...optionalParams) => {
    if (level !== LogLevel.DEBUG) {
        console.log("tiny-git-server>" + message, ...optionalParams);
    }
};
function convertLogMessageToString(message, ...optionalParams) {
    let str = message?.toString();
    for (let param of optionalParams) {
        if (typeof param === "string" || typeof param === "number") {
            str += param;
        }
        else if (param === undefined) {
            break;
        }
        else if (Array.isArray(param) && param.length == 0) {
            break;
        }
        else {
            str += JSON.stringify(param);
        }
    }
    return str;
}

export { DefaultLogging, FileSystem, GitAnnotatedTag, GitCommit, GitPackIndex, GitPktLine, GitRefManager, GitTree, LogLevel, _readObject, convertLogMessageToString, init, listRefs, padHex, parseUploadPackRequest, setIsomorphicGit, setIsomorphicGitInternal, writeObject };
//# sourceMappingURL=index.js.map
