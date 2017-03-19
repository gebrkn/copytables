// Selection tools.
var M = module.exports = {};

var dom = require('../lib/dom'),
    util = require('../lib/util'),
    message = require('../lib/message'),
    cell = require('../lib/cell'),
    table = require('./table')
    ;

M.selectable = function (el) {
    return !!(el && dom.closest(el, 'table') && !dom.closest(el, 'a, input, button'));
};

M.selected = function (el) {
    return cell.selected(el);
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
}


M.enumTables = function () {
    var selected = M.table(),
        all = [];

    dom.find('table').forEach(function (tbl, n) {
        if (!dom.cells(tbl).length)
            return;
        all.push({
            index: n,
            selected: tbl === selected
        });
    });
    return all;
};

M.selectNthTable = function (index) {
    dom.find('table').forEach(function (tbl, n) {
        if (n === index) {
            window.getSelection().removeAllRanges();
            message.background('dropOtherSelections')

            dom.cells(tbl).forEach(function (td) {
                cell.set(td, 'selected');
            });
            tbl.scrollIntoView(true);
        }
    });
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

M.toggle = function (el, mode) {
    if (!M.start(el)) {
        return;
    }

    var t = table.locate(el),
        tds = [],
        sel = dom.bounds(t.td);

    dom.cells(table).forEach(function (td) {
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

    tds.forEach(tds.every(cell.selected) ? cell.reset : cell.select);
};
