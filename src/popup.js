var
    dom = require('./lib/dom'),
    preferences = require('./lib/preferences'),
    message = require('./lib/message'),
    event = require('./lib/event'),
    util = require('./lib/util')
;

function captureButtons() {
    var mode = preferences.val('_captureMode') || 'zzz';

    return preferences.captureModes().map(function (m) {
        return util.format(
            '<button class="${cls}" data-command="capture_${id}">${name}</button>',
            {
                id: m.id,
                name: m.name,
                cls: (m.id === mode) ? 'on' : ''
            });
    }).join('');
}

function copyButtons() {
    return preferences.copyFormats().filter(function (f) {
        return f.enabled;
    }).map(function (f) {
        return util.format(
            '<button data-command="copy_${id}" title="${desc}">${name}</button>',
            f);
    }).join('');
}

function update() {

    dom.findOne('#copy-buttons').innerHTML = copyButtons();

    if (preferences.val('capture.enabled')) {
        dom.findOne('#capture-row').style.display = '';
        dom.findOne('#capture-buttons').innerHTML = captureButtons();
    } else {
        dom.findOne('#capture-row').style.display = 'none';
    }
}

function init() {
    update();

    event.listen(document, {
        'click': function (e) {
            var cmd = dom.attr(e.target, 'data-command');
            if (cmd) {
                message.background({name: 'command', command: cmd});
            }
            if (!dom.attr(e.target, 'data-keep-open')) {
                window.close();
            }
        }
    });
}

window.onload = function () {
    preferences.load().then(init);
};
