var ecstatic = require('ecstatic');
var split = require('split2');
var through = require('through2');
var crypto = require('crypto');

var st = ecstatic(__dirname + '/public');
var http = require('http');
var server = http.createServer(function (req, res) { st(req, res) });
server.listen(5000, function () {
    console.log('http://localhost:' + server.address().port);
});

var streams = {};
var wsock = require('websocket-stream');
wsock.createServer({ server: server }, function (stream) {
    var id = crypto.randomBytes(16).toString('hex');
    streams[id] = stream;
    var ended = false;
    
    stream.pipe(split()).pipe(through(function (buf, enc, next) {
        if (ended) return;
        
        var line = buf.toString();
        Object.keys(streams).forEach(function (key) {
            if (key === id) return;
            try { streams[key].write(line + '\n') }
            catch (e) {}
        });
        next();
    }));
    
    stream.once('end', onend);
    stream.once('close', onend);
    stream.on('error', onend);
    
    function onend () {
        ended = true;
        delete streams[id];
    }
});
