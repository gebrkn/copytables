/// Display diverse functions when dragging over a table

var M = module.exports = {};

var dom = require('../lib/dom'),
    preferences = require('../lib/preferences'),
    util = require('../lib/util');

var barElement = null,
    showTimer = 0,
    defaultDelay = 300,

    activeClass = '__copytables_infobar__active';


function bar() {
    if (barElement === null) {
        barElement = document.createElement('div');
        barElement.innerHTML = '<div></div><span></span>';
        barElement.className = '__copytables_infobar__';
        document.body.appendChild(barElement);
        barElement.lastChild.addEventListener('click', M.hide);
    }
    return barElement;
}

function show() {
    if (dom.hasClass(barElement, activeClass)) {
        return;
    }

    showTimer = setTimeout(function () {
        dom.addClass(barElement, activeClass);
    }, defaultDelay);
}

function hide() {
    clearTimeout(showTimer);
    dom.removeClass(barElement, activeClass);
}


function sum(values) {
    return values.reduce(function (s, v) {
        return s + v.number;
    }, 0);
}

function format(n) {
    return Number(n.toFixed(2)).toLocaleString();
}

var compute = {

    count: function (values) {
        return values.length;
    },

    sum: function (values) {
        return format(sum(values));
    },

    avg: function (values) {
        return format(values.length ? (sum(values) / values.length) : 0);
    },

    min: function (values) {
        var vs = values.map(function (v) {
            return v.number;
        });
        return format(vs.length ? Math.min.apply(Math, vs) : 0);
    },

    max: function (values) {
        var vs = values.map(function (v) {
            return v.number;
        });
        return format(vs.length ? Math.max.apply(Math, vs) : 0);
    }
};

function textContent(node, c) {
    if (node.nodeType === 3) {
        var t = (node.textContent || '').trim();
        if (t.length)
            c.push(t);
        return;
    }

    if (!dom.visible(node)) {
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

    var p = Number(t.replace(/[^\d-]/g, '')),
        q = Number(p + '.' + f);

    if (Number.isNaN(q)) {
        return null;
    }

    return q;
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

M.data = function (cells) {
    if (!cells.length) {
        return null;
    }

    var values = [];

    cells.forEach(function (td) {
        values.push(getValue(td));
    });

    return preferences.infoFunctions().map(function (f) {
        return {name: f.name, value: compute[f.id](values) || 0};
    });
};


M.show = function (data) {
    var html = data.map(function (c) {
        return util.format('<span><span>${name}</span> <span>${value}</span></span>', c);
    }).join('');

    bar().firstChild.innerHTML = html;
    M.updatePosition();
    show();
};

M.hide = function () {
    hide();
};

M.updatePosition = function () {
    if (!barElement)
        return;

    ['lt', 'rt', 'lb', 'rb'].forEach(function (p) {
        var cls = '__copytables_infobar__' + p;
        dom.removeClass(barElement, cls);
        if (preferences.val('infobar.placement.' + p)) {
            dom.addClass(barElement, cls);
        }
    });

};
