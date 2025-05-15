# tiny-git-server

Pure JavaScript GitServer which has few features.



## Demo

https://tiny-git-server.vercel.app/

## Motivation

When I develop web system, I want little versioning of file.
For examples, OAS definition, or configuration json file.


## Run Example

### local filesystem mode

```bash
tiny-git-server>npm install
tiny-git-server>npm run build
tiny-git-server>cp -r packages/util/dist/* node_modules/@funkjk/tiny-git-server-util/dist/
tiny-git-server>cd examples/node-examples
node-examples>npm install
node-examples>USE_SQLFS=false npm run dev
usingFileSystem:localFileSystem path=dist/repos
2025-05-07 14:59:26 main info: start server port 3000 
```

### Use git cli

```bash
curl -v -X POST "http://localhost:3000/init?repo=testgitrepo1"
git clone http://localhost:3000/testgitrepo1
cd testgitrepo1
echo "first file" >> test.txt
git add test.txt
git commit -m "first commit"
git push
```


### SQL filesystem mode

start DB server using examples/postgresql-docker/docker-compose.yml.
(which include ddl execution.)

```bash
$>USE_SQLFS=true npm run dev
usingFileSystem:sqlfs url=postgres://postgres:postgres@localhost:5433/gitdb01
2025-05-07 14:58:13 main info: start server port 3000 
```
