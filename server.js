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
    var samples = [];
    stream.pipe(split()).pipe(through(function (buf, enc, next) {
        var xy = buf.toString().split(',');
        samples.push({
            x: Number(xy[0]),
            y: Number(xy[1]),
            time: Date.now()
        });
        var delta = samples[samples.length-1].time - samples[0].time;
        if (samples.length >= 5 || delta > 500) {
            var d = motion(samples);
            if (d > 15) {
                console.log('BALLS', d);
            }
            else console.log(d)
            samples = [];
        }
        next();
    }));
});

function motion (xs) {
    var max = 0;
    for (var i = 0; i < xs.length - 1; i++) {
        var x = xs[i].x - xs[i+1].x;
        var y = xs[i].y - xs[i+1].y;
        var d = Math.sqrt(x*x + y*y);
        max = Math.max(d, max);
    }
    return max;
}
