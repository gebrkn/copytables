var M = module.exports = {};

var dom = require('../lib/dom'),
    cell = require('../lib/cell'),
    css = require('../lib/css'),
    event = require('../lib/event'),
    util = require('../lib/util')
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

M.copy = function (tbl, options) {
    console.log(util.timeStart('table.copy'));

    // lock selected cells to remove highlighting with no animation
    dom.cells(tbl).forEach(function (td) {
        if (cell.selected(td)) {
            cell.lock(td)
        }
    });

    if (options.method === 'transfer') {
        var data = {
            css: {},
            html: ''
        };

        if (options.keepStyles) {
            dom.findSelf('*', tbl).forEach(function (el, uid) {
                dom.attr(el, 'data-copytables-uid', uid);
                data.css[uid] = css.read(el);
            });
        }

        data.html = tbl.outerHTML;

        if (options.keepStyles) {
            dom.findSelf('*', tbl).forEach(function (el) {
                dom.removeAttr(el, 'data-copytables-uid');
            });
        }
    }

    if (options.method === 'clipboard') {
        var data = true;

        dom.select(tbl);

        // wrap copy in a capturing handler to work around copy-hijackers

        var copyHandler = function (evt) {
            console.log('COPY IN TABLE');
            evt.stopPropagation();
        };

        document.addEventListener('copy', copyHandler, true);
        document.execCommand('copy');
        document.removeEventListener('copy', copyHandler, true);

        dom.deselect();
    }

    dom.cells(tbl).forEach(function (td) {
        if (cell.selected(td)) {
            cell.unlock(td)
        }
    });

    console.log('table.copy method=' + options.method);
    console.log(util.timeEnd('table.copy'));

    return data;
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
