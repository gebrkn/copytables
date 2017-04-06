var M = module.exports = {};

var dom = require('../lib/dom'),
    matrix = require('../lib/matrix'),
    util = require('../lib/util'),
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
}

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

function removeHiddenElements(node) {
    var hidden = [];

    dom.find('*', node).forEach(function (el) {
        if (!dom.visible(el)) {
            hidden.push(el);
        }
    });

    if (hidden.length) {
        console.log('removeHidden: ' + hidden.length);
        dom.remove(hidden);
    }
}

M.table = function (url) {
    var _ts = new Date();

    console.log('new paste.table', url);

    this.frame = document.createElement('IFRAME');
    this.frame.setAttribute('sandbox', 'allow-same-origin');
    document.body.appendChild(this.frame);

    this.doc = this.frame.contentDocument;
    this.body = this.doc.body;

    var base = this.doc.createElement('BASE');
    dom.attr(base, 'href', url);
    this.body.appendChild(base);

    this.div = this.doc.createElement('DIV');
    this.div.contentEditable = true;
    this.body.appendChild(this.div);

    this.div.focus();
    this.doc.execCommand('paste');

    this.table = this.div.firstChild;

    if (!this.table || this.table.tagName !== 'TABLE') {
        throw 'no table pasted';
    }

    console.log('new paste.table: ' + ((new Date()) - _ts));
};

M.table.prototype.prepare = function (options) {

    var _ts = new Date();

    if (options.useSelection) {
        trim(this.table);
    }

    fixRelativeLinks(this.doc, this.table);
    dom.cells(this.table).forEach(cell.reset);

    // if (options.removeHidden) {
    //     removeHiddenElements(this.div);
    // }

    if (options.removeStyles) {
        dom.findSelf('*', this.table).forEach(function (el) {
            dom.removeAttr(el, 'style');
            dom.removeAttr(el, 'class');
        });
    }

    console.log('paste.prepare: ' + ((new Date()) - _ts));
};

M.table.prototype.html = function () {
    return this.div.innerHTML;
};

M.table.prototype.textMatrix = function () {
    return matrix.map(toMatrix(this.table), function (_, node) {
        return node.td ? dom.textContent(node.td).join(' ') : '';
    });
};

M.table.prototype.destroy = function () {
    document.body.removeChild(this.frame);
};
