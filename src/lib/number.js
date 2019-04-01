/// Tools to work with numbers

var M = module.exports = {};

function isDigit(s) {
    return s.match(/^\d+$/);
}

function parseInteger(s) {
    if (!isDigit(s)) {
        return null;
    }
    var n = Number(s);
    return isDigit(String(n)) ? n : null;
}

function parseFraction(s) {
    var n = parseInteger('1' + s);
    return n === null ? null : String(n).slice(1);
}

function parseGrouped(s, fmt) {
    if (!fmt.group || s.indexOf(fmt.group) < 0) {
        return parseInteger(s);
    }

    var g = '\\' + fmt.group;
    var re = new RegExp('^\\d{1,3}(' + g + '\\d{2,3})*$');

    if (!s.match(re)) {
        return null;
    }

    return parseInteger(s.replace(/\D+/g, ''));
}

M.parse = function (s, fmt) {

    if (s[0] === '-') {
        var n = M.parse(s.slice(1), fmt);
        return n === null ? null : -n;
    }

    if (!fmt.decimal || s.indexOf(fmt.decimal) < 0) {
        return parseGrouped(s, fmt);
    }

    if (s === fmt.decimal) {
        return null;
    }

    var ds = s.split(fmt.decimal);

    if (ds.length === 1) {
        return parseGrouped(ds[0], fmt);
    }

    if (ds.length === 2) {
        var a = ds[0].length ? parseGrouped(ds[0], fmt) : 0;
        var b = ds[1].length ? parseFraction(ds[1]) : 0;

        if (a === null || b === null) {
            return null;
        }

        return Number(a + '.' + b);
    }

    return null;
};

M.extract = function (text, fmt) {
    if (!text) {
        return null;
    }

    text = String(text).replace(/^\s+|\s+$/g, '');
    if (!text) {
        return null;
    }

    var g = fmt.group ? '\\' + fmt.group : '';
    var d = fmt.decimal ? '\\' + fmt.decimal : '';

    var re = new RegExp('-?[\\d' + g + d + ']*\\d', 'g');
    var m = text.match(re);

    if (!m || m.length !== 1) {
        return null;
    }

    var n = M.parse(m[0], fmt);
    if (n === null) {
        return null;
    }

    return n;
};

M.defaultFormat = function () {
    var f = {group: ',', decimal: '.'};

    try {
        // Intl and formatToParts might not be available...

        var nf = new Intl.NumberFormat();

        nf.formatToParts(123456.78).forEach(function (p) {
            if (String(p.type) === 'group')
                f.group = p.value;
            if (String(p.type) === 'decimal')
                f.decimal = p.value;
        })
        return f;
    } catch (e) {
    }

    try {
        var s = (123456.78).toLocaleString().replace(/\d/g, ''),
            len = s.length;

        f.decimal = len > 0 ? s[len - 1] : '.';
        f.group = len > 1 ? s[len - 2] : '';
        return f;

    } catch (e) {
    }

    return f;
};

M.format = function (n, prec) {
    n = prec ? Number(n.toFixed(prec)) : Number(n);
    return (n || 0).toLocaleString();
};
