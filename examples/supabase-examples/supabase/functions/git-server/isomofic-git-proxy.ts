import { setIsomorphicGit,setIsomorphicGitInternal } from 'tiny-git-server/server';

//@ts-ignore
import * as igit from "isomorphic-git/internal-apis"
//@ts-ignore
import * as git from "isomorphic-git"

setIsomorphicGitInternal(igit)
setIsomorphicGit(git)
