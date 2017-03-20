// Selection tools.
var M = module.exports = {};

var dom = require('../lib/dom'),
    message = require('../lib/message'),
    cell = require('../lib/cell'),
    table = require('./table')
    ;

function cellsToSelect(el, mode) {
    var t = table.locate(el);

    if (!t)
        return [];

    var tds = [],
        sel = dom.bounds(t.td);

    dom.cells(t.table).forEach(function (td) {
        var b = dom.bounds(td),
            ok = false;

        switch (mode) {
            case 'column':
                ok = sel.x == b.x;
                break;
            case 'row':
                ok = sel.y == b.y;
                break;
            case 'table':
                ok = true;
                break;
        }

        if (ok) {
            tds.push(td);
        }
    });

    return tds;
}


M.selectable = function (el) {
    return !!(el && dom.closest(el, 'table') && !dom.closest(el, 'a, input, button'));
};

M.selected = function (el) {
    var t = table.locate(el);
    return t && cell.selected(t.td);
};

M.drop = function () {
    dom.find('td, th').forEach(cell.reset);
}

M.active = function () {
    return !!cell.find('selected').length;
};

M.table = function () {
    var cs = cell.find('selected');
    return cs.length ? dom.closest(cs[0], 'table') : null;
};

M.start = function (el) {
    var t = table.locate(el);

    if (!t) {
        return false;
    }

    window.getSelection().removeAllRanges();
    message.background('dropOtherSelections')

    if (M.table() !== t.table) {
        M.drop();
    }

    return true;
};


M.select = function (el, mode) {
    if (M.start(el)) {
        var tds = cellsToSelect(el, mode);
        tds.forEach(cell.select);
    }
};

M.toggle = function (el, mode) {
    if (M.start(el)) {
        var tds = cellsToSelect(el, mode);
        tds.forEach(tds.every(cell.selected) ? cell.reset : cell.select);
    }
};
