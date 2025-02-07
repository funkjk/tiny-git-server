import { setIsomorphicGit,setIsomorphicGitInternal } from 'tiny-git-server/server/isomorphic-git-proxy';

//@ts-ignore
// import * as igit from "isomorphic-git/internal-apis.cjs"
// import * as git from "isomorphic-git"

//@ts-ignore
import * as igit from "../../isomorphic-git/internal-apis.cjs"
//@ts-ignore
import * as git from "../../isomorphic-git/index.cjs"

setIsomorphicGitInternal(igit)
setIsomorphicGit(git)
