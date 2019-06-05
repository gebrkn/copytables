var M = module.exports = {};

var paste = require('./paste'),
    dom = require('../lib/dom'),
    matrix = require('../lib/matrix'),
    util = require('../lib/util'),
    clipboard = require('./clipboard')
;

function trimTextMatrix(mat) {
    mat = matrix.map(mat, function (row, cell) {
        return util.strip(util.nobr(cell));
    });
    return matrix.trim(mat, Boolean);
}

function asTabs(mat) {
    return trimTextMatrix(mat).map(function (row) {
        return row.join('\t')
    }).join('\n');
}

function asCSV(mat) {
    return trimTextMatrix(mat).map(function (row) {
        return row.map(function (cell) {
            if (cell.match(/^\w+$/) || cell.match(/^-?[0-9]+(\.[0-9]*)?$/))
                return cell;
            return '"' + cell.replace(/"/g, '""') + '"';
        }).join(',')
    }).join('\n');
}

function asTextile(mat, withHTML) {
    var rows = mat.map(function (row) {

        var cells = row
            .filter(function (node) {
                return node.td
            })
            .map(function (node) {

                var t = '', s = '';

                if (withHTML)
                    t = dom.htmlContent(node.td);
                else
                    t = dom.textContent(node.td);

                if (node.colSpan)
                    s += '\\' + (node.colSpan + 1);
                if (node.rowSpan)
                    s += '/' + (node.rowSpan + 1);
                if (s)
                    s += '.';

                return '|' + s + ' ' + t.replace('|', '&#124;');

            });

        return cells.join(' ') + ' |';
    });

    return rows.join('\n');
}


M.formats = {};

M.formats.richHTMLCSS = {
    opts: {method: 'clipboard', withSelection: true, keepStyles: true, keepHidden: false},
    exec: function (t) {
        clipboard.copyRich(t.html())
    }
};

M.formats.richHTML = {
    opts: {method: 'clipboard', withSelection: true, keepStyles: false, keepHidden: false},
    exec: function (t) {
        clipboard.copyRich(t.html())
    }
};

M.formats.textTabs = {
    opts: {method: 'clipboard', withSelection: true, keepStyles: false, keepHidden: false},
    exec: function (t) {
        clipboard.copyText(asTabs(t.textMatrix()))
    }
};

M.formats.textTabsTranspose = {
    opts: {method: 'clipboard', withSelection: true, keepStyles: false, keepHidden: false},
    exec: function (t) {
        clipboard.copyText(asTabs(matrix.transpose(t.textMatrix())))
    }
};

M.formats.textCSV = {
    opts: {method: 'clipboard', withSelection: true, keepStyles: false, keepHidden: false},
    exec: function (t) {
        clipboard.copyText(asCSV(t.textMatrix()))
    }
};

M.formats.textCSVTranspose = {
    opts: {method: 'clipboard', withSelection: true, keepStyles: false, keepHidden: false},
    exec: function (t) {
        clipboard.copyText(asCSV(matrix.transpose(t.textMatrix())))
    }
};

M.formats.textHTML = {
    opts: {method: 'clipboard', withSelection: true, keepStyles: false, keepHidden: true},
    exec: function (t) {
        clipboard.copyText(util.reduceWhitespace(t.html()))
    }
};

M.formats.textHTMLCSS = {
    opts: {method: 'clipboard', withSelection: true, keepStyles: true, keepHidden: true},
    exec: function (t) {
        clipboard.copyText(util.reduceWhitespace(t.html()))
    }
};

M.formats.textTextileHTML = {
    opts: {method: 'clipboard', withSelection: true, keepStyles: false, keepHidden: false},
    exec: function (t) {
        clipboard.copyText(asTextile(t.nodeMatrix(), true))
    }
};

M.formats.textTextile = {
    opts: {method: 'clipboard', withSelection: true, keepStyles: false, keepHidden: false},
    exec: function (t) {
        clipboard.copyText(asTextile(t.nodeMatrix(), false))
    }
};


//

M.options = function (format) {
    return M.formats[format].opts;
};

M.exec = function (format, data) {
    var ok = false,
        t = new paste.table(),
        fmt = M.formats[format];

    if (t.init(data, fmt.opts)) {
        fmt.exec(t);
        ok = true;
    }

    t.destroy();
    return ok;
};
