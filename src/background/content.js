
var M = module.exports = {};

var dom = require('../lib/dom'),
    matrix = require('../lib/matrix'),
    util = require('../lib/util'),
    css = require('../lib/css'),
    cell = require('../lib/cell')
    ;

function toMatrix(tbl) {
    var tds = {},
        rows = {},
        cols = {};

    dom.cells(tbl).forEach(function (td) {
        var bounds = dom.bounds(td);
        var c = bounds.x, r = bounds.y;
        cols[c] = rows[r] = 1;
        tds[r + '/' + c] = td;
    });

    rows = Object.keys(rows).sort(util.numeric);
    cols = Object.keys(cols).sort(util.numeric);

    var mat = rows.map(function (r) {
        return cols.map(function (c) {
            var td = tds[r + '/' + c];
            return td ? {td: td} : {};
        });
    });

    matrix.each(mat, function (row, node, ri, ni) {
        if (!node.td)
            return;

        var rs = parseInt(dom.attr(node.td, 'rowSpan')) || 1;
        var cs = parseInt(dom.attr(node.td, 'colSpan')) || 1;

        for (var i = 1; i < cs; i++) {
            if (row[ni + i] && !row[ni + i].td)
                row[ni + i].colRef = node;
        }
        for (var i = 1; i < rs; i++) {
            if (mat[ri + i] && mat[ri + i][ni] && !mat[ri + i][ni].td)
                mat[ri + i][ni].rowRef = node;
        }
    });

    return mat;
};


function trim(tbl) {
    var mat = matrix.filter(toMatrix(tbl), function (node) {
        return cell.selected(node.td);
    });

    var tds = [];

    matrix.each(mat, function (row, node) {
        if (node.td) {
            tds.push(node.td);
        }
    });

    var junk = [];

    dom.cells(tbl).forEach(function (td) {
        if (tds.indexOf(td) < 0)
            junk.push(td);
        else if (!cell.selected(td))
            td.innerHTML = '';
    });

    dom.remove(junk);
    junk = [];

    dom.find('tr', tbl).forEach(function (tr) {
        if (dom.find('td, th', tr).length === 0) {
            junk.push(tr);
        }
    });

    dom.remove(junk);

    matrix.each(mat, function (_, node) {
        if (node.colRef)
            node.colRef.colSpan = (node.colRef.colSpan || 0) + 1;
        if (node.rowRef)
            node.rowRef.rowSpan = (node.rowRef.rowSpan || 0) + 1;
    });

    matrix.each(mat, function (_, node) {
        if (node.td) {
            dom.attr(node.td, 'rowSpan', node.rowSpan ? (node.rowSpan + 1) : null);
            dom.attr(node.td, 'colSpan', node.colSpan ? (node.colSpan + 1) : null);
        }
    });
};


function fixRelativeLinks(doc, el) {

    function fix(tags, attrs) {
        dom.find(tags, el).forEach(function (t) {
            attrs.forEach(function (attr) {
                var v = dom.attr(t, attr);
                if (v) {
                    a.href = v;
                    dom.attr(t, attr, a.href);
                }
            });
        });
    }

    var a = doc.createElement('A');

    fix('A, AREA, LINK', ['href']);
    fix('IMG, INPUT, SCRIPT', ['src', 'longdesc', 'usemap']);
    fix('FORM', ['action']);
    fix('Q, BLOCKQUOTE, INS, DEL', ['cite']);
    fix('OBJECT', ['classid', 'codebase', 'data', 'usemap']);
}


M.prepare = function (content, useSelection) {

    var frame = document.createElement('IFRAME');
    frame.setAttribute('sandbox', 'allow-same-origin');
    document.body.appendChild(frame);

    var doc = frame.contentDocument,
        body = doc.body;

    var base = doc.createElement('BASE');
    dom.attr(base, 'href', content.url);
    body.appendChild(base);

    var div = doc.createElement('DIV');
    div.innerHTML = content.rawHTML;
    body.appendChild(div);

    var tbl = div.firstChild;

    dom.findSelf('*', tbl).forEach(function (el) {
        dom.removeAttr(el, 'style');
    });

    if (useSelection) {
        trim(tbl);
    }

    fixRelativeLinks(doc, tbl);

    dom.cells(tbl).forEach(cell.reset);

    dom.findSelf('*', tbl).forEach(function (el) {
        var uid = dom.attr(el, 'data-copytables-uid');
        if (el.style) {
            el.style.cssText = css.compute(css.read(el), content.css[uid]);
        }
        dom.removeAttr(el, 'data-copytables-uid');
    });

    content.HTMLCSS = div.innerHTML;

    dom.findSelf('*', tbl).forEach(function (el) {
        dom.removeAttr(el, 'style');
    });

    content.HTML = div.innerHTML;

    content.textMatrix = matrix.map(toMatrix(tbl), function (_, node) {
        return node.td ? node.td.textContent : '';
    });

    document.body.removeChild(frame);
    return content;
};


