var M = module.exports = {};

var content = require('./content'),

    matrix = require('../lib/matrix'),
    util = require('../lib/util')
    ;

function richCopy(text) {
    var t = document.createElement('div');
    document.body.appendChild(t);

    t.contentEditable = true;
    t.innerHTML = text;

    var range = document.createRange();
    range.selectNodeContents(t);

    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    document.execCommand('copy');
    document.body.removeChild(t);
}

function textCopy(text) {
    var t = document.createElement('textarea');
    document.body.appendChild(t);

    t.value = text;
    t.focus();
    t.select();

    document.execCommand('copy');
    document.body.removeChild(t);
}


function asTabs(mat) {
    return mat.map(function (row) {
        return row.map(function (cell) {
            return util.strip(util.nobr(cell))
        }).join('\t')
    }).join('\n');
}

function asCSV(mat) {
    return mat.map(function (row) {
        return row.map(function (cell) {
            var s = util.strip(util.nobr(cell));
            if (s.match(/^-?[0-9]+(\.[0-9]+)?$/))
                return s;
            return '"' + s.replace(/"/g, '""') + '"';
        }).join(',')
    }).join('\n');
}

M.richHTMLCSS = function (c, useSelection) {
    c = content.prepare(c, useSelection, true);
    return richCopy(c.HTMLCSS);
};

M.richHTML = function (c, useSelection) {
    c = content.prepare(c, useSelection, true);
    return richCopy(c.HTML);
};

M.textTabs = function (c, useSelection) {
    c = content.prepare(c, useSelection, true);
    return textCopy(asTabs(c.textMatrix));
};

M.textCSV = function (c, useSelection) {
    c = content.prepare(c, useSelection, true);
    return textCopy(asCSV(c.textMatrix));
};

M.textTabsSwap = function (c, useSelection) {
    c = content.prepare(c, useSelection, true);
    return textCopy(asTabs(matrix.transpose(c.textMatrix)));
};

M.textCSV = function (c, useSelection) {
    c = content.prepare(c, useSelection, true);
    return textCopy(asCSV(c.textMatrix));
};

M.textCSVSwap = function (c, useSelection) {
    c = content.prepare(c, useSelection, true);
    return textCopy(asCSV(matrix.transpose(c.textMatrix)));
};

M.textHTML = function (c, useSelection) {
    c = content.prepare(c, useSelection, false);
    return textCopy(util.reduceWhitespace(c.HTML));
};

M.textHTMLCSS = function (c, useSelection) {
    c = content.prepare(c, useSelection, false);
    return textCopy(util.reduceWhitespace(c.HTMLCSS));
};
