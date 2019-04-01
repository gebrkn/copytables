// Utility functions.

var M = module.exports = {};

M.numeric = function (a, b) {
    return a - b;
};

M.toArray = function (coll) {
    return Array.prototype.slice.call(coll || [], 0);
};

M.flatten = function (a) {
    while (a.some(Array.isArray))
        a = Array.prototype.concat.apply([], a);
    return a;
};

M.first = function (a, fn) {
    for (var i = 0; i < a.length; i++) {
        if (fn(a[i], i)) {
            return a[i];
        }
    }
    return null;
};

M.intersect = function (a, b) {
    return !(a[0] >= b[2] || a[2] <= b[0] || a[1] >= b[3] || a[3] <= b[1])
};

M.lstrip = function (s) {
    return s.replace(/^\s+/, '')
};

M.rstrip = function (s) {
    return s.replace(/\s+$/, '')
};

M.strip = function (s) {
    return s.replace(/^\s+|\s+$/g, '');
};

M.reduceWhitespace = function (html) {
    return html.replace(/\n\r/g, '\n')
        .replace(/\n[ ]+/g, '\n')
        .replace(/[ ]+\n/g, '\n')
        .replace(/\n+/g, '\n');
};

M.uid = function (len) {
    var s = '';
    while (len--) {
        s += String.fromCharCode(97 + Math.floor(Math.random() * 26));
    }
    return s;
};

M.nobr = function (s) {
    return s.replace(/[\r\n]+/g, ' ');
};

M.format = function (s, obj) {
    return s.replace(/\${(\w+)}/g, function (_, $1) {
        return obj[$1];
    });
};

var _times = {};

M.timeStart = function (name) {
    _times[name] = new Date;
    return 'TIME START: ' + name;
};

M.timeEnd = function (name) {
    if (_times[name]) {
        var t = new Date() - _times[name];
        delete _times[name];
        return 'TIME END: ' + name + ' ' + t;
    }
};

function callChrome(useAsync, fn, args) {
    var parts = fn.split('.'),
        obj = chrome,
        method = parts.pop();

    parts.forEach(function (p) {
        obj = obj[p];
    });

    console.log('CALL_CHROME', useAsync, fn);

    if (!useAsync) {
        try {
            return obj[method].apply(obj, args);
        } catch (err) {
            console.log('CALL_CHROME_ERROR', fn, err.message);
            return null;
        }
    }
    return new Promise(function (resolve, reject) {
        function callback(res) {
            var err = chrome.runtime.lastError;
            if (err) {
                console.log('CALL_CHROME_LAST_ERROR', fn, err);
                resolve(null);
            } else {
                resolve(res);
            }
        }

        try {
            obj[method].apply(obj, args.concat(callback));
        } catch (err) {
            console.log('CALL_CHROME_ERROR', fn, err.message);
            resolve(null);
        }
    });
}

M.callChrome = function (fn) {
    return callChrome(false, fn, [].slice.call(arguments, 1));
};

M.callChromeAsync = function (fn) {
    return callChrome(true, fn, [].slice.call(arguments, 1));
};
