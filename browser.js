var wsock = require('websocket-stream');
var ws = wsock('ws://' + location.host);

window.addEventListener('devicemotion', function (ev) {
    var a = ev.accelerationIncludingGravity;
    if (a.x !== null) ws.write(a.x + ',' + a.y + '\n');
});
