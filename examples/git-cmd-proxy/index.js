var http = require('http');
var spawn = require('child_process').spawn;
var path = require('path');
var backend = require('git-http-backend');
var zlib = require('zlib');

var server = http.createServer(function (req, res) {


    var repo = req.url.split('/')[1];
    // var dir = path.join('../', 'repos', repo);
    var dir = "../repos/"+repo
    // console.log("dir",dir)
    var reqStream = req.headers['content-encoding'] == 'gzip' ? req.pipe(zlib.createGunzip()) : req;

    reqStream.pipe(backend(req.url, function (err, service) {
        if (err) return res.end(err + '\n');
        
        res.setHeader('content-type', service.type);
        // console.log(service.action, repo, service.fields);
        
        var ps = spawn(service.cmd, service.args.concat(dir));
        ps.stdout.pipe(service.createStream()).pipe(ps.stdin);
        
        // ps.stdout.pipe(process.stdout);
        ps.stdout.on('data', (data) => {
            console.log("res",data.toString("hex"))
        })
        reqStream.on('data', (data) => {
            console.log("req",data.toString("hex"))
        })
        
        
    })).pipe(res);
});
server.listen(3000);
console.log("start")