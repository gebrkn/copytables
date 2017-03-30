var M = module.exports = {};

var paste = require('./paste'),
    matrix = require('../lib/matrix'),
    util = require('../lib/util')
;

M.richCopy = function(text) {
    var _ts = new Date();

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

    console.log('richCopy', ((new Date()) - _ts));
};

M.textCopy = function(text) {
    var _ts = new Date();

    var t = document.createElement('textarea');
    document.body.appendChild(t);

    t.value = text;
    t.focus();
    t.select();

    document.execCommand('copy');
    document.body.removeChild(t);

    console.log('textCopy', ((new Date()) - _ts));
};

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

M.formats = {};

M.formats.richHTMLCSS = function (url) {
    var t = new paste.table(url);
    t.prepare({
        useSelection: true,
        removeHidden: true,
        removeStyles: false
    });
    M.richCopy(t.html());
    t.destroy();
};

M.formats.richHTML = function (url) {
    var t = new paste.table(url);
    t.prepare({
        useSelection: true,
        removeHidden: true,
        removeStyles: true
    });
    M.richCopy(t.html());
    t.destroy();
};

M.formats.textTabs = function (url) {
    var t = new paste.table(url);
    t.prepare({
        useSelection: true,
        removeHidden: true,
        removeStyles: false
    });
    M.textCopy(asTabs(t.textMatrix()));
    t.destroy();
};

M.formats.textCSV = function (url) {
    var t = new paste.table(url);
    t.prepare({
        useSelection: true,
        removeHidden: true,
        removeStyles: false
    });
    M.textCopy(asCSV(t.textMatrix()));
    t.destroy();
};

M.formats.textTabsSwap = function (url) {
    var t = new paste.table(url);
    t.prepare({
        useSelection: true,
        removeHidden: true,
        removeStyles: false
    });
    M.textCopy(asTabs(matrix.transpose(t.textMatrix())));
    t.destroy();
};

M.formats.textCSVSwap = function (url) {
    var t = new paste.table(url);
    t.prepare({
        useSelection: true,
        removeHidden: true,
        removeStyles: false
    });
    M.textCopy(asCSV(matrix.transpose(t.textMatrix())));
    t.destroy();
};

M.formats.textHTML = function (url) {
    var t = new paste.table(url);
    t.prepare({
        useSelection: true,
        removeHidden: false,
        removeStyles: true
    });
    M.textCopy(util.reduceWhitespace(t.html()));
    t.destroy();
};

M.formats.textHTMLCSS = function (url) {
    var t = new paste.table(url);
    t.prepare({
        useSelection: true,
        removeHidden: false,
        removeStyles: false
    });
    M.textCopy(util.reduceWhitespace(t.html()));
    t.destroy();
};
