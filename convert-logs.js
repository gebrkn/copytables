/// In dev, rewrite console.logs to something more readable when logged to stdout
/// In production, get rid of them

function __dbg() {
    var nl = '\n',
        buf = [nl];

    function type(x) {
        try {
            return Object.prototype.toString.call(x).replace('[object ', '').replace(']', '');
        } catch (e) {
            return '';
        }
    }

    function props(x, depth) {
        var r = Array.isArray(x) ? [] : {};
        try {
            Object.keys(x).forEach(function(k) {
                r[k] = inspect(x[k], depth + 1);
            });
            return r;
        } catch(e) {
            return 'error';
        }
    }

    function inspect(x, depth) {
        if (depth > 5)
            return '...';
        if (typeof x !== 'object' || x === null)
            return x;
        var t = type(x),
            p = props(x, depth);
        if(t === 'Object' || t === 'Array')
            return p;
        var r = {};
        r[t] = p;
        return r;
    }

    buf.push(location ? location.href : '??');

    [].forEach.call(arguments, function (arg) {
        var t = inspect(arg, 0);
        t = JSON.stringify(t, 0, 4);
        buf = buf.concat(t.split(nl));
    });

    return buf.map(function (x) {
        return x + nl;
    });
}


function handleLogging(content, path, isDev) {

    var dbg = String(__dbg);
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