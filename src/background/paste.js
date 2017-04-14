var M = module.exports = {};

var dom = require('../lib/dom'),
    matrix = require('../lib/matrix'),
    util = require('../lib/util'),
    cell = require('../lib/cell'),
    css = require('../lib/css')
;

function toMatrix(tbl) {
    console.log(util.timeStart('toMatrix'));

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

    console.log(util.timeEnd('toMatrix'));

    return mat;
};


function trim(tbl) {
    console.log(util.timeStart('trim.filter'));

    var mat = matrix.filter(toMatrix(tbl), function (node) {
        return cell.selected(node.td);
    });

    console.log(util.timeEnd('trim.filter'));

    console.log(util.timeStart('trim.remove'));

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

    console.log(util.timeEnd('trim.remove'));

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

function fixRelativeLinks(where, fixCssUrls) {

    var aa = where.ownerDocument.createElement('A');

    function fixUrl(url) {
        // since we've set BASE url, this works
        aa.href = url;
        return aa.href;
    }

    function fixTags(tags, attrs) {
        dom.find(tags, where).forEach(function (t) {
            attrs.forEach(function (attr) {
                var v = dom.attr(t, attr);
                if (v) {
                    dom.attr(t, attr, fixUrl(v));
                }
            });
        });
    }


    fixTags('A, AREA, LINK', ['href']);
    fixTags('IMG, INPUT, SCRIPT', ['src', 'longdesc', 'usemap']);
    fixTags('FORM', ['action']);
    fixTags('Q, BLOCKQUOTE, INS, DEL', ['cite']);
    fixTags('OBJECT', ['classid', 'codebase', 'data', 'usemap']);

    if (fixCssUrls) {
        dom.find('*', where).forEach(function (el) {
            var style = dom.attr(el, 'style');

            if (!style || style.toLowerCase().indexOf('url') < 0)
                return;

            var fixStyle = style.replace(/(\burl\s*\()([^()]+)/gi, function (_, pfx, url) {
                url = util.strip(url);
                if (url[0] === '"' || url[0] === '\'') {
                    return pfx + url[0] + fixUrl(url.slice(1, -1)) + url[0];
                }
                return pfx + fixUrl(url);
            });

            if (fixStyle !== style)
                dom.attr(el, 'style', fixStyle);
        });
    }
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

M.table = function () {
};

M.table.prototype.init = function (url, data, options) {
    console.log(util.timeStart('paste.init'));

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

    var ok = this.initTable(data, options);

    console.log('paste.init=' + ok + ' method=' + options.method);
    console.log(util.timeEnd('paste.init'));

    return ok;
};

M.table.prototype.initTable = function (data, options) {


    console.log(util.timeStart('paste.insertTable'));

    if (options.method === 'clipboard') {
        this.div.focus();

        // NB: just pasting the clipboard via `this.doc.execCommand('paste')`
        // is very slow for some reason. Instead, intercept paste
        // to obtain the clipboard and insert it via innerHTML which is waaay faster

        var clipboard = '';

        var pasteHandler = function (evt) {
            console.info('paste handler toggled');
            clipboard = evt.clipboardData.getData('text/html');
            evt.stopPropagation();
            evt.preventDefault();
        };

        document.addEventListener('paste', pasteHandler, true);
        document.execCommand('paste');
        document.removeEventListener('paste', pasteHandler);
        this.div.innerHTML = clipboard;
    }

    if(options.method === 'transfer') {
        this.div.innerHTML = data.html;
    }

    console.log(util.timeEnd('paste.insertTable'));

    this.table = dom.findOne('table', this.div);

    if (!this.table || this.table.tagName.toUpperCase() !== 'TABLE')
        return false;


    if (options.withSelection) {
        console.log(util.timeStart('paste.trim'));
        trim(this.table);
        console.log(util.timeEnd('paste.trim'));
    }


    if (options.method === 'transfer' && options.keepStyles) {
        console.log(util.timeStart('paste.restoreStyles'));

        dom.findSelf('*', this.table).forEach(function (el) {
            var uid = dom.attr(el, 'data-copytables-uid');
            if (uid && el.style) {
                dom.removeAttr(el, 'style');
                el.style.cssText = css.compute(css.read(el), data.css[uid] || {});
            }
            dom.removeAttr(el, 'data-copytables-uid')
        });

        console.log(util.timeEnd('paste.restoreStyles'));
    }

    if (options.method === 'transfer' && !options.keepHidden) {
        console.log(util.timeStart('paste.removeHidden'));
        removeHiddenElements(this.div);
        console.log(util.timeEnd('paste.removeHidden'));
    }

    fixRelativeLinks(this.div, options.keepStyles);
    dom.cells(this.table).forEach(cell.reset);

    if (!options.keepStyles) {
        dom.findSelf('*', this.table).forEach(function (el) {
            dom.removeAttr(el, 'style');
            dom.removeAttr(el, 'class');
        });
    }

    return true;
};

M.table.prototype.html = function () {
    return this.table.outerHTML;
};

M.table.prototype.textMatrix = function () {
    return matrix.map(toMatrix(this.table), function (_, node) {
        return node.td ? dom.textContent(node.td).join(' ') : '';
    });
};

M.table.prototype.destroy = function () {
    if (this.frame)
        document.body.removeChild(this.frame);
};
