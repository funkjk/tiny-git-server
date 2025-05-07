# tiny-git-server

Pure JavaScript GitServer which has few features.




## Run Example

### Build isomophic-git

tiny-git-server use isomophic-git's internal api.
So build isomophic-git.

```bash
git submodule update --init
cd isomorphic-git
export NODE_OPTIONS=--openssl-legacy-provider
npm run build
```

### local filesystem mode

```bash
$>USE_SQLFS=false npm run dev
usingFileSystem:localFileSystem path=dist/repos
2025-05-07 14:59:26 main info: start server port 3000 
```

### Use git cli

```bash
curl -v -X POST "http://localhost:3000/init?repo=testgitrepo1"
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
