var M = module.exports = {};

var
    dom = require('../lib/dom'),
    util = require('../lib/util')
;


M.copyRich = function (text) {
    console.log(util.timeStart('copyRich'));

    var t = document.createElement('div');
    document.body.appendChild(t);

    t.contentEditable = true;
    t.innerHTML = text;

    dom.select(t);
    document.execCommand('copy');
    document.body.removeChild(t);

    console.log(util.timeEnd('copyRich'));
};

M.copyText = function (text) {
    console.log(util.timeStart('copyText'));

    var t = document.createElement('textarea');
    document.body.appendChild(t);

    t.value = text;
    t.focus();
    t.select();

    document.execCommand('copy');
    document.body.removeChild(t);

    console.log(util.timeEnd('copyText'));
};

M.content = function () {
    var cc = '',
        pasted = false;

    var pasteHandler = function (evt) {
        if (pasted)
            return;
        pasted = true;
        console.log('paste handler toggled');
        cc = evt.clipboardData.getData('text/html');
        evt.stopPropagation();
        evt.preventDefault();
    };

    document.addEventListener('paste', pasteHandler, true);
    console.log('exec paste');
    document.execCommand('paste');
    document.removeEventListener('paste', pasteHandler);
    return cc;
};