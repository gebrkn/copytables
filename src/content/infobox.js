/// Display diverse functions when dragging over a table

var M = module.exports = {};

var cell = require('../lib/cell'),
    dom = require('../lib/dom'),
    event = require('../lib/event'),
    preferences = require('../lib/preferences');

function sum(vs) {
    return vs.reduce(function (x, y) {
        return x + y
    });
}

function getNumbers(values) {
    var vs = [];

    values.forEach(function (v) {
        if (v.isNumber)
            vs.push(v.number);
    });

    return vs.length ? vs : null;
}

var naSymbol = '-';

function format(n) {
    return Number(n.toFixed(2)).toLocaleString();
}

var compute = {

    count: function (values) {
        return values.length;
    },

    sum: function (values) {
        var vs = getNumbers(values);
        return vs ? format(sum(vs)) : naSymbol;
    },

    avg: function (values) {
        var vs = getNumbers(values);
        return vs ? format(sum(vs) / vs.length) : naSymbol;
    },

    min: function (values) {
        var vs = getNumbers(values);
        return vs ? format(Math.min.apply(Math, vs)) : naSymbol;
    },

    max: function (values) {
        var vs = getNumbers(values);
        return vs ? format(Math.max.apply(Math, vs)) : naSymbol;
    }
};

function parseNumber(t) {
    // 123.45
    if (t.match(/^\d+(\.\d+)?$/)) {
        return Number(t);
    }

    // -12,345,678.00
    if (t.match(/^\d{1,3}(,\d{3})+(\.\d+)?$/)) {
        return Number(t.split(',').join(''));
    }

    // 1234,5678
    if (t.match(/^\d+,\d+$/)) {
        return Number(t.split(',').join('.'));
    }

    // 12.345.678,00
    if (t.match(/^\d{1,3}(\.\d{3})+(,\d+)?$/)) {
        return Number(t.split('.').join('').split(',').join('.'));
    }
}

function numberValue(t) {
    var m = t.match(/-?\d+([.,]\d+)*/g);

    if (!m || m.length !== 1) {
        return null;
    }

    t = m[0];

    var sign = 1;

    if (t[0] === '-') {
        t = t.slice(1);
        sign = -1;
    }

    var n = parseNumber(t);
    if (!isNaN(n)) {
        return sign * n;
    }

    return null;
}

function getValue(td) {
    var val = {text: '', number: 0, isNumber: false};

    dom.textContent(td).some(function (t) {
        var n = numberValue(t);
        if (n !== null) {
            return val = {text: t, number: n, isNumber: true};
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

var
    boxId = '__copytables_infobox__',
    pendingContent = null,
    timer = 0,
    freq = 500;

function getBox() {
    return dom.findOne('#' + boxId);
}

function setTimer() {
    if (!timer)
        timer = setInterval(draw, freq);
}

function clearTimer() {
        clearInterval(timer);
        timer = 0;
}

function html(items) {
    var h = [];

    items.forEach(function (item) {
        if (item.message !== naSymbol)
            h.push('<b>' + item.title + '<i>' + item.message + '</i></b>');
    });

    return '<span>' + h.join('') + '</span>';
}

function init() {
    var box = dom.create('div', {
        id: boxId,
        'data-position': preferences.val('infobox.position') || '0'
    });
    document.body.appendChild(box);
    return box;
}

function draw() {
    if (!pendingContent) {
        console.log('no pendingContent');
        clearTimer();
        return;
    }

    if (pendingContent === 'hide') {
        console.log('removed');
        dom.remove([getBox()]);
        clearTimer();
        return;
    }

    var box = getBox() || init();

    dom.removeClass(box, 'hidden');
    box.innerHTML = pendingContent;

    pendingContent = null;
    console.log('drawn');
}

function show(items) {
    var p = html(items);

    if (p === pendingContent) {
        console.log('same content');
        return;
    }

    if (pendingContent) {
        console.log('queued');
    }

    pendingContent = p;
    setTimer();
}

function hide() {
    console.log('about to remove...');
    pendingContent = 'hide';
    dom.addClass(getBox(), 'hidden');
    setTimer();
}

M.update = function (tbl) {
    if (preferences.val('infobox.enabled')) {
        show(data(tbl));
    }
};

M.remove = function () {
    hide();
};

