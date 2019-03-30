var readline = require('readline');

function proc(line) {
    var m = line.match(/@@CT<<(.+?)>>CT@@/);
    if (!m)
        return '';
    var data = JSON.parse(m[1]);

    var url = data.shift();

    if (url.match(/^chrome-extension/))
        url = '';

    var file = data.shift();
    var line = data.shift();

    var prefix = file.split('src/')[1].split('.')[0] + ":" + line + " ";

    var s = data.map(function(x) {
        return JSON.stringify(x)
    }).join(' ');

    if(url)
        s += '        ' + url;

    console.log(prefix + s);

}

readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
}).on('line', proc);
