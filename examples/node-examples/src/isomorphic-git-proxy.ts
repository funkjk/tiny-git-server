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
