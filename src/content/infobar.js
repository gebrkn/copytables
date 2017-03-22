/// Display diverse functions when dragging over a table

var M = module.exports = {};

var preferences = require('../lib/preferences');

var barElement = null,
    showTimer = 0,
    defaultDelay = 500;

function bar() {
    if (barElement === null) {
        barElement = document.createElement('div');
        barElement.innerHTML = '<div></div><div>&times;</div>';
        barElement.className = '__copytables_infobar__';
        document.body.appendChild(barElement);
        barElement.lastChild.addEventListener('click', M.hide);
    }
    return barElement;
}

function show() {
    if (!barElement || barElement.classList.contains('active'))
        return;

    showTimer = setTimeout(function () {
        if (barElement)
            barElement.classList.add('active');
    }, defaultDelay);
}

function hide() {
    clearTimeout(showTimer);
    if (barElement)
        barElement.classList.remove('active');
}


function sum(values) {
    return values.reduce(function (s, v) {
        return s + v.number;
    }, 0);
}

var compute = {

    count: function (values) {
        return values.length;
    },

    sum: function (values) {
        return sum(values).toFixed(2);
    },

    avg: function (values) {
        return (values.length ? (sum(values) / values.length) : 0).toFixed(2);
    },

    min: function (values) {
        var vs = values.map(function (v) {
            return v.number;
        });
        return (vs.length ? Math.min.apply(Math, vs) : 0).toFixed(2);
    },

    max: function (values) {
        var vs = values.map(function (v) {
            return v.number;
        });
        return (vs.length ? Math.max.apply(Math, vs) : 0).toFixed(2);
    }
};

function textContent(node, c) {
    if (node.nodeType === 3) {
        var t = (node.textContent || '').trim();
        if (t.length)
            c.push(t);
        return;
    }

    if (!node.offsetWidth) {
        return;
    }

    (node.childNodes || []).forEach(function (n) {
        textContent(n, c);
    });
}

function numberValue(t) {
    if (!t.match(/^-?[\d,.]+$/))
        return null;

    var m = t.match(/^(.+?)[.,](\d\d?)$/),
        f = 0;

    if (m) {
        f = Number(m[2]);
        t = m[1];
    }

    var n = Number(t.replace(/[^\d-]/g, ''));

    if (Number.isNaN(n))
        return null;

    return Number(n + '.' + f);
}

function getValue(td) {
    var c = [],
        val = {text: '', number: 0};

    textContent(td, c);

    c.some(function (t) {
        var n = numberValue(t);
        if (n !== null) {
            return val = {text: t, number: n};
        }
    });

    return val;
}


M.show = function (cells) {
    var values = [];

    cells.forEach(function (td) {
        values.push(getValue(td));
    });

    var html = preferences.infoFunctions().map(function (f) {
        var res = compute[f.id](values) || 0;
        return '<span><span>' + f.name + '</span> <span>' + res + ' </span></span>';
    }).join('');

    bar().firstChild.innerHTML = html;
    show();
};

M.hide = function () {
    hide();
};
