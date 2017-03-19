/// In dev, rewrite console.logs to something more readable when logged to stdout
/// In production, get rid of them

function handleLogging(content, path, isDev) {

    var dbg = `
        function __dbg() {
            var sep = '\\n',
                buf = [sep];
            buf.push(location?location.href:'??');
            [].forEach.call(arguments, function(arg) {
                try {
                    arg = (typeof arg === 'object') ? JSON.stringify(arg,0,4) : String(arg);
                } catch(e) {
                    arg = String(arg);
                };
                buf = buf.concat(arg.split('\\n'));
            });
            buf.push(sep);
            return buf.map(function(x) { return x + '\\n' });
        }
    `;

    var out = [];

    if (isDev) {
        out.push(dbg.replace(/\s+/g, ' '));
    }

    content.split('\n').forEach(function (line, lnum) {
        var ref = path + ':' + (lnum + 1);
        var m = line.match(/(.*?)console\.log\((.*)\)(.*)/);

        if (m) {
            if (isDev) {
                out.push(`${m[1]}__dbg("${ref}",${m[2]}).forEach(console.log.bind(console))${m[3]}`);
            }
        } else {
            if (isDev && line.match(/function/)) {
                out.push(` // ${ref}`);
            }
            out.push(line);
        }
    });

    return out.join('\n');
}


module.exports = function (content) {
    return handleLogging(content, this.resourcePath, this.query == '?dev')
}