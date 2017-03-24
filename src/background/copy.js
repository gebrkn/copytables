var M = module.exports = {};

var matrix = require('../lib/matrix'),
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

M.richHTMLCSS = function (content) {
    return richCopy(content.HTMLCSS);
};

M.richHTML = function (content) {
    return richCopy(content.HTML);
};

M.textTabs = function (content) {
    return textCopy(asTabs(content.textMatrix));
};

M.textCSV = function (content) {
    return textCopy(asCSV(content.textMatrix));
};

M.textTabsSwap = function (content) {
    return textCopy(asTabs(matrix.transpose(content.textMatrix)));
};

M.textCSV = function (content) {
    return textCopy(asCSV(content.textMatrix));
};

M.textCSVSwap = function (content) {
    return textCopy(asCSV(matrix.transpose(content.textMatrix)));
};

M.textHTML = function (content) {
    return textCopy(content.HTML);
};

M.textHTMLCSS = function (content) {
    return textCopy(content.HTMLCSS);
};

