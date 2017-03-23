var
    dom = require('./lib/dom'),
    preferences = require('./lib/preferences'),
    message = require('./lib/message'),
    event = require('./lib/event')
    ;

function highlightCaptureButton(mode) {
    mode = mode || 'off';
    dom.find('#capture-commands button').forEach(function (btn) {
        var m = (dom.attr(btn, 'data-command') || '').replace('capture', '').toLowerCase();
        if (m === mode) {
            dom.addClass(btn, 'on');
        } else {
            dom.removeClass(btn, 'on');
        }
    });
}


function update() {

    var cc = dom.findOne('#copy-commands');

    cc.innerHTML = '';

    preferences.copyFormats().forEach(function (f) {
        if (f.enabled) {
            var a = document.createElement('button');
            dom.attr(a, 'data-command', 'copy' + f.id);
            a.textContent = f.name;
            cc.appendChild(a);
        }
    });

    if (preferences.val('capture.enabled')) {
        dom.findOne('#capture-commands').style.display = '';
        highlightCaptureButton(preferences.val('_captureMode'));
    } else {
        dom.findOne('#capture-commands').style.display = 'none';
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
            window.close();
        }
    });
}

window.onload = function () {
    preferences.load().then(init);
};

