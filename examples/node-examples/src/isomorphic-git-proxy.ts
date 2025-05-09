import { setIsomorphicGit,setIsomorphicGitInternal } from '@funkjk/tiny-git-server-util';

//@ts-ignore
import * as igit from "@funkjk/isomorphic-git/internal-apis"
import * as git from "@funkjk/isomorphic-git"


setIsomorphicGitInternal(igit)
setIsomorphicGit(git)
