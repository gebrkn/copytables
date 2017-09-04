var
    dom = require('./lib/dom'),
    preferences = require('./lib/preferences'),
    keyboard = require('./lib/keyboard'),
    event = require('./lib/event'),
    message = require('./lib/message'),
    util = require('./lib/util')
;

var mouseButtonNames = ['Left Button', 'Middle/Wheel', 'Right Button', 'Button 3', 'Button 4'];

function modifiers(mode) {

    var tpl = [
        '<label class="sticky">',
        '   <input type="checkbox" ${checked} data-modifier="${code}" data-mode="${mode}">',
        '   <span>${name}</span>',
        '</label>'
    ].join('');

    var kmod = preferences.val('modifier.' + mode);

    return keyboard.mouseModifiers.map(function (m) {
        return util.format(tpl, {
            code: m,
            name: keyboard.modHTMLNames[m],
            mode: mode,
            checked: (kmod & m) ? 'checked' : ''
        });
    }).join('');
}

function copyFormats() {

    var tpl = [
        '<tr>',
        '   <td><b>${name}</b><i>${desc}</i></td>',
        '   <td><label class="cb">',
        '       <input type="checkbox" data-bool="copy.format.enabled.${id}"><span>Enabled</span>' +
        '   </label></td>',
        '   <td><label class="sticky">',
        '       <input type="radio" name="defaultFormat" data-bool="copy.format.default.${id}"><span>Default</span>',
        '   </label></td>',
        '</tr>'
    ].join('');


    var s = preferences.copyFormats().map(function (f) {
        return util.format(tpl, f);
    });

    return '<table>' + s.join('') + '</table>';
}


function load() {
    dom.findOne('#copy-formats').innerHTML = copyFormats();

    dom.find('[data-modifiers]').forEach(function (el) {
        el.innerHTML = modifiers(dom.attr(el, 'data-modifiers'));
    });

    dom.find('[data-bool]').forEach(function (el) {
        el.checked = !!preferences.val(dom.attr(el, 'data-bool'));
    });

    dom.find('[data-select]').forEach(function (el) {
        el.checked = preferences.val(dom.attr(el, 'data-select')) === dom.attr(el, 'data-select-value');
    });

    dom.find('[data-text]').forEach(function (el) {
        var t = preferences.val(dom.attr(el, 'data-text'));
        el.value = typeof t === 'undefined' ? '' : t;
    });
}

function save() {
    var prefs = {};

    dom.find('[data-modifier]').forEach(function (el) {
        var code = Number(dom.attr(el, 'data-modifier')),
            mode = dom.attr(el, 'data-mode');
        prefs['modifier.' + mode] = (prefs['modifier.' + mode] || 0) | (el.checked ? code : 0);
    });

    dom.find('[data-bool]').forEach(function (el) {
        prefs[dom.attr(el, 'data-bool')] = !!el.checked;
    });

    dom.find('[data-select]').forEach(function (el) {
        if (el.checked)
            prefs[dom.attr(el, 'data-select')] = dom.attr(el, 'data-select-value');
    });

    dom.find('[data-text]').forEach(function (el) {
        prefs[dom.attr(el, 'data-text')] = el.value;
    });

    preferences.setAll(prefs).then(load);
    message.background('preferencesUpdated');
}


window.onload = function () {
    preferences.load().then(load);

    event.listen(window, {
        input: save,
        change: save,
        click: function (e) {
            var cmd = dom.attr(e.target, 'data-command');
            if (cmd) {
                message.background({name: 'command', command: cmd});
                event.reset(e);
            }
        }
    });
};

