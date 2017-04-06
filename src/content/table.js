var M = module.exports = {};

var dom = require('../lib/dom'),
    cell = require('../lib/cell')
    ;

function listTables() {
    var all = [];

    dom.find('table').forEach(function (tbl, n) {
        if (!dom.cells(tbl).length || !dom.visible(tbl))
            return;
        all.push({
            index: n,
            table: tbl
        });
    });

    return all;
}

M.locate = function (el) {
    var td = dom.closest(el, 'td, th'),
        tbl = dom.closest(td, 'table');

    return (td && tbl) ? {td: td, table: tbl} : null;
};

M.indexOf = function (tbl) {
    var res = -1;

    listTables().forEach(function (r) {
        if (tbl === r.table)
            res = r.index;
    });

    return res;
};

M.byIndex = function (index) {
    var res = null;

    listTables().forEach(function (r) {
        if (index === r.index)
            res = r.table;
    });

    console.log('byIndex', res);
    return res;
};

M.enum = function (selectedTable) {
    return listTables().map(function (r) {
        r.selected = r.table === selectedTable;
        delete r.table;
        return r;
    });
};

M.copy = function (tbl) {
    var _ts = new Date();

    dom.cells(tbl).forEach(function(td) {
        if(cell.selected(td)) {
            cell.lock(td)
        }
    });

    var range = document.createRange();
    range.selectNodeContents(tbl);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand('copy');
    sel.removeAllRanges();

    dom.cells(tbl).forEach(function(td) {
        if(cell.selected(td)) {
            cell.unlock(td)
        }
    });

    console.log('content.copy: ' + ((new Date()) - _ts));
};

M.selectCaptured = function (tbl) {
    dom.cells(tbl).forEach(function (td) {
        if (cell.locked(td)) {
            cell.reset(td);
        } else if (cell.marked(td)) {
            cell.unmark(td);
            cell.select(td);
        }
    });
};
