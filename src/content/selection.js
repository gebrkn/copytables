/// Selection tools.

var M = module.exports = {};

var dom = require('../lib/dom'),
    message = require('../lib/message'),
    cell = require('../lib/cell'),
    table = require('./table'),
    infobox = require('./infobox')
;

function cellsToSelect(el, mode) {
    if (mode === 'table') {
        var tbl = dom.closest(el, 'table');
        return tbl ? dom.cells(tbl) : [];
    }

    var t = table.locate(el);

    if (!t) {
        return [];
    }

    if (mode === 'cell') {
        return [t.td];
    }

    var sel = dom.bounds(t.td);

    return dom.cells(t.table).filter(function (td) {
        var b = dom.bounds(td);

        switch (mode) {
            case 'column':
                return sel.x === b.x;
            case 'row':
                return sel.y === b.y;
        }
    });
}

var excludeElements = 'a, input, button, textarea, select, img';

M.selectable = function (el) {
    return !!(el && dom.closest(el, 'table') && !dom.closest(el, excludeElements));
};

M.selected = function (el) {
    var t = table.locate(el);
    return t && cell.selected(t.td);
};

M.drop = function () {
    dom.find('td, th').forEach(cell.reset);
};

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
    if (dom.is(el, 'table'))
        el = dom.cells(el)[0];
    if (el && M.start(el)) {
        var tds = cellsToSelect(el, mode);
        tds.forEach(cell.select);
    }
};

M.toggle = function (el, mode) {
    if (dom.is(el, 'table'))
        el = dom.cells(el)[0];
    if (el && M.start(el)) {
        var tds = cellsToSelect(el, mode),
            fn = tds.every(cell.selected) ? cell.reset : cell.select;
        tds.forEach(fn);
    }
};
