var ecstatic = require('ecstatic');
var split = require('split2');
var through = require('through2');

var st = ecstatic(__dirname + '/public');
var http = require('http');
var server = http.createServer(function (req, res) { st(req, res) });
server.listen(5000, function () {
    console.log('http://localhost:' + server.address().port);
});

var wsock = require('websocket-stream');
wsock.createServer({ server: server }, function (stream) {
    stream.pipe(split()).pipe(through(function (buf, enc, next) {
        var parts = buf.toString().split(',');
        console.log(parts);
        next();
    }));
});
