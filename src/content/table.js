var M = module.exports = {};

var dom = require('../lib/dom'),
    css = require('../lib/css'),
    cell = require('../lib/cell')
    ;

M.locate = function (el) {
    var
        td = dom.closest(el, 'td, th'),
        tbl = td ? dom.closest(td, 'table') : null;
    return {td: td, table: tbl};
};

M.indexOf = function (tbl) {
    return dom.indexOf(tbl, 'table');
};

M.nth = function (n) {
    return dom.nth(n, 'table');
};

M.rawContent = function (tbl) {
    var c = {
        url: document.location.href,
        css: {},
        html: ''
    };

    dom.findSelf('*', tbl).forEach(function (el, uid) {
        var sel = cell.selected(el);
        if (sel) {
            cell.unselect(el);
        }
        dom.attr(el, 'data-copytables-uid', uid);
        c.css[uid] = css.read(el);
        if (sel) {
            cell.select(el);
        }
    });

    c.html = tbl.outerHTML;

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