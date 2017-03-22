var M = module.exports = {};

var dom = require('../lib/dom'),
    css = require('../lib/css'),
    cell = require('../lib/cell')
    ;

function listTables() {
    var all = [];

    dom.find('table').forEach(function (tbl, n) {
        if (!dom.cells(tbl).length)
            return;
        all.push({
            index: n,
            table: tbl
        });
    });

    return all;
};

M.locate = function (el) {
    if (!el) {
        return null;
    }

    if (dom.is(el, 'table')) {
        var cells = dom.cells(el);
        return cells.length ? {td: cells[0], table: el} : null;
    }

    var td = dom.closest(el, 'td, th'),
        tbl = td ? dom.closest(td, 'table') : null;

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

    console.log('byIndex', res)
    return res;
};

M.enum = function (selectedTable) {
    return listTables().map(function (r) {
        r.selected = r.table === selectedTable;
        delete r.table;
        return r;
    });
}

M.rawContent = function (tbl) {
    var c = {
        url: document.location.href,
        css: {},
        rawHTML: ''
    };

    dom.findSelf('*', tbl).forEach(function (el, uid) {
        var sel = cell.selected(el);
        if (sel) {
            // lock it to remove background without firing off an animation
            cell.lock(el);
        }
        dom.attr(el, 'data-copytables-uid', uid);
        c.css[uid] = css.read(el);
        if (sel) {
            cell.unlock(el);
        }
    });

    c.rawHTML = tbl.outerHTML;

    dom.findSelf('*', tbl).forEach(function (el) {
        dom.removeAttr(el, 'data-copytables-uid');
    });

    return c;
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
