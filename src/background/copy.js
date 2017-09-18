var M = module.exports = {};

var paste = require('./paste'),
    dom = require('../lib/dom'),
    matrix = require('../lib/matrix'),
    util = require('../lib/util')
;

M.richCopy = function (text) {
    console.log(util.timeStart('richCopy'));

    var t = document.createElement('div');
    document.body.appendChild(t);

    t.contentEditable = true;
    t.innerHTML = text;

    dom.select(t);
    document.execCommand('copy');
    document.body.removeChild(t);

    console.log(util.timeEnd('richCopy'));
};

M.textCopy = function (text) {
    console.log(util.timeStart('textCopy'));

    var t = document.createElement('textarea');
    document.body.appendChild(t);

    t.value = text;
    t.focus();
    t.select();

    document.execCommand('copy');
    document.body.removeChild(t);

    console.log(util.timeEnd('textCopy'));
};

function trimTextMatrix(mat) {
    mat = matrix.map(mat, function(row, cell) {
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

function asTextile(mat) {
    return trimTextMatrix(mat).map(function (row) {
        return '|' + row.map(function (cell) {
            return ' ' + cell + ' ';
        }).join('|')
    }).join('|\n') + '|';
}


M.formats = {};

M.formats.richHTMLCSS = {
    opts: { method: 'clipboard', withSelection: true, keepStyles: true, keepHidden: false },
    exec: function(t) { M.richCopy(t.html()) }
};

M.formats.richHTML = {
    opts: { method: 'clipboard', withSelection: true, keepStyles: false, keepHidden: false },
    exec: function(t) { M.richCopy(t.html()) }
};

M.formats.textTabs = {
    opts: { method: 'clipboard', withSelection: true, keepStyles: false, keepHidden: false },
    exec: function(t) { M.textCopy(asTabs(t.textMatrix())) }
};

M.formats.textTabsSwap = {
    opts: { method: 'clipboard', withSelection: true, keepStyles: false, keepHidden: false },
    exec: function(t) { M.textCopy(asTabs(matrix.transpose(t.textMatrix()))) }
};

M.formats.textCSV = {
    opts: { method: 'clipboard', withSelection: true, keepStyles: false, keepHidden: false },
    exec: function(t) { M.textCopy(asCSV(t.textMatrix())) }
};

M.formats.textCSVSwap = {
    opts: { method: 'clipboard', withSelection: true, keepStyles: false, keepHidden: false },
    exec: function(t) { M.textCopy(asCSV(matrix.transpose(t.textMatrix()))) }
};

M.formats.textHTML = {
    opts: { method: 'clipboard', withSelection: true, keepStyles: false, keepHidden: true },
    exec: function(t) { M.textCopy(util.reduceWhitespace(t.html())) }
};

M.formats.textHTMLCSS = {
    opts: { method: 'clipboard', withSelection: true, keepStyles: true, keepHidden: true },
    exec: function(t) { M.textCopy(util.reduceWhitespace(t.html())) }
};

M.formats.textTextile = {
    opts: { method: 'clipboard', withSelection: true, keepStyles: false, keepHidden: false },
    exec: function(t) { M.textCopy(asTextile(t.textMatrix())) }
};


//

M.options = function(format) {
    return M.formats[format].opts;
};

M.exec = function(format, data) {
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
