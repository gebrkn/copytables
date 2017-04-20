/// Display diverse functions when dragging over a table

var M = module.exports = {};

var cell = require('../lib/cell'),
    dom = require('../lib/dom'),
    message = require('../lib/message'),
    preferences = require('../lib/preferences');

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


function numberValue(t) {
    var m = t.match(/-?[\d,.]+/g);

    if (!m || m.length !== 1)
        return null;

    var s = m[0],
        f = 0;

    m = s.match(/^(.+?)[.,](\d\d?)$/);

    if (m) {
        f = Number(m[2]);
        s = m[1];
    }

    var p = Number(s.replace(/[^\d-]/g, '')),
        q = Number(p + '.' + f);

    if (Number.isNaN(q)) {
        return null;
    }

    return q;
}

function getValue(td) {
    var val = {text: '', number: 0};

    dom.textContent(td).some(function (t) {
        var n = numberValue(t);
        if (n !== null) {
            return val = {text: t, number: n};
        }
    });

    return val;
}

function data(tbl) {
    if (!tbl) {
        return null;
    }

    var cells = cell.findSelected(tbl);

    if (!cells || !cells.length) {
        return null;
    }


    var values = [];

    cells.forEach(function (td) {
        values.push(getValue(td));
    });

    return preferences.infoFunctions().map(function (f) {
        return {title: f.name + ':', message: String(compute[f.id](values) || 0)};
    });
};

M.update = function (tbl) {
    if (preferences.val('infobox.enabled')) {
        message.background({
            name: 'showInfoBox',
            data: data(tbl)
        });
    }
};
