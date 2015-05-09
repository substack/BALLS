var wsock = require('websocket-stream');
var ws = wsock('ws://' + location.host);
var balls = document.querySelector('#balls');
var samples = [];

var through = require('through2');

ws.pipe(through(function (buf, enc, next) {
    var parts = buf.toString().split(',');
    if (parts[0] === 'BALLS') {
        showBalls();
    }
    next();
}));

window.addEventListener('devicemotion', function (ev) {
    var a = ev.accelerationIncludingGravity;
    if (a.x === null) return;
    
    samples.push({
        x: a.x,
        y: a.y,
        time: Date.now()
    });
    var delta = samples[samples.length-1].time - samples[0].time;
    if (samples.length >= 5 || delta > 500) {
        var d = motion(samples) * 100;
        if (d > 40) {
            showBalls();
            ws.write('BALLS,' + d + '\n');
        }
        else console.log(d)
        samples = [];
    }
});

function motion (xs) {
    var max = 0;
    for (var i = 0; i < xs.length - 1; i++) {
        var x = xs[i].x - xs[i+1].x;
        var y = xs[i].y - xs[i+1].y;
        var delta = xs[i+1].time - xs[i].time;
        if (delta === 0) continue;
        var d = Math.sqrt(x*x + y*y) / delta;
        max = Math.max(d, max);
    }
    return max;
}

var timeout = null;
function showBalls () {
    balls.style.display = 'block';
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(function () {
        balls.style.display = 'none';
    }, 500);
}
