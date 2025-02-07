
https://orm.drizzle.team/docs/get-started/postgresql-new

https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/introduction

https://github.com/isomorphic-git/isomorphic-git
https://github.com/isomorphic-git/lightning-fs
https://github.com/isomorphic-git/isomorphic-git/blob/main/src/models/FileSystem.js

https://supabase.com/docs/guides/functions/quickstart

git http
https://github.com/bahamas10/node-git-http-server/blob/master/git-http-server.js
https://github.com/giorgi94/git-http-backend-nodejs/blob/master/backend/service.js
https://www.npmjs.com/package/git-http-backend
https://github.com/taisukef/deno-git-server/blob/main/GitServer.js
https://github.com/stackdot/NodeJS-Git-Server/blob/master/lib/host.js
https://github.com/kzwang/node-git-lfs/blob/master/lib/app.js
https://github.com/isomorphic-git/server
https://github.com/isomorphic-git/isomorphic-git
https://github.com/isomorphic-git/isomorphic-git/blob/feat/server/src/commands/serveReceivePack.js
https://git-scm.com/book/ja/v2/Git%e3%81%ae%e5%86%85%e5%81%b4-%e8%bb%a2%e9%80%81%e3%83%97%e3%83%ad%e3%83%88%e3%82%b3%e3%83%ab
https://github.com/awslabs/git-remote-s3/blob/main/git_remote_s3/manage.py
https://git-scm.com/docs/pack-protocol/2.29.0

https://git-scm.com/docs/gitprotocol-capabilities

https://shafiul.github.io/gitbook/7_transfer_protocols.html
https://motemen.hatenablog.com/entry/2016/03/git-pack-protocol-explained
https://github.com/google/gitprotocolio/blob/master/PROTOCOL.md

multi_ack thin-pack side-band side-band-64k ofs-delta shallow deepen-since deepen-not deepen-relative no-progress include-tag multi_ack_detailed symref=HEAD:refs/heads/master 
object-format=sha1 agent=git/2.39.3.(Apple.Git-146)
report-status report-status-v2 delete-refs side-band-64k quiet atomic ofs-delta 
object-format=sha1 agent=git/2.39.3.(Apple.Git-146)

github
001f# service=git-receive-pack
0000009b0000000000000000000000000000000000000000 capabilities^{}report-status delete-refs side-band-64k quiet atomic ofs-delta agent=git/github-gcd21660c8f10
0000



cd isomorphic-git
npm i
nvm use v16
export NODE_OPTIONS=--openssl-legacy-provider
 npx nps build.rollup && npx nps build.typings && npx nps build.webpack && npx nps build.indexjson && npx nps build.treeshake


export GIT_TRACE=1
export GIT_CURL_VERBOSE=1
export GIT_TRACE_PACKET=true

rm -rf .git out3.txt && git clone http://localhost:3000/test_git_20250111  ./
echo "test" >> out3.txt &&  git add . && git commit -m "test" && git push



deno run --allow-all --unstable-detect-cjs server.ts
npm run build && cd examples/node-examples && rm -rf node_modules/tiny-git-server && npm install && cd ../.. && npm run examples

npm run build && cp -r ./dist/* ./examples/deno-examples/node_modules/tiny-git-server/

deno compile --allow-all --unstable-detect-cjs --no-check  server.ts

