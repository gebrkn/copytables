var
    dom = require('./lib/dom'),
    preferences = require('./lib/preferences'),
    keyboard = require('./lib/keyboard'),
    event = require('./lib/event'),
    message = require('./lib/message')
    ;

var mouseButtonNames = ['Left Button', 'Middle/Wheel', 'Right Button', 'Button 3', 'Button 4'];

var formatTemplate = [
    '<tr>',
    '   <td><b>{name}</b><i>{desc}</i></td>',
    '   <td><label class="cb">',
    '       <input type="checkbox" data-bool="copy.format.enabled.{id}"><span>Enabled</span>' +
    '   </label></td>',
    '   <td><label class="sticky">',
    '       <input type="radio" name="defaultFormat" data-bool="copy.format.default.{id}"><span>Default</span>',
    '   </label></td>',
    '</tr>'
].join('');


function load() {

    var formats = preferences.copyFormats().map(function (f) {
        return formatTemplate.replace(/{(\w+)}/g, function ($0, $1) {
            return f[$1];
        });
    });

    dom.findOne('#copy-formats').innerHTML = '<table>' + formats.join('') + '</table>';

    dom.find('[data-modifier]').forEach(function (el) {
        var code = Number(dom.attr(el, 'data-modifier')),
            mode = dom.attr(el, 'data-mode');
        el.checked = preferences.val('modifier.' + mode) & code;
    });

    dom.find('[data-bool]').forEach(function (el) {
        el.checked = !!preferences.val(dom.attr(el, 'data-bool'));
    });

    dom.find('[data-text]').forEach(function (el) {
        el.value = preferences.val(dom.attr(el, 'data-text')) || '';
    });

    dom.find('[data-modifier-name]').forEach(function (el) {
        el.innerHTML = keyboard.modHTMLNames[dom.attr(el, 'data-modifier-name')];
    });

    dom.find('.mousepad').forEach(function (el) {
        var val = dom.findOne('input', el).value || 0,
            span = dom.findOne('span', el);
        span.innerHTML = mouseButtonNames[val];
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

    dom.find('.mousepad').forEach(function (el) {
        event.listen(el, {
            mousedown: function (e) {
                if (e.button !== 2) {
                    dom.findOne('input', el).value = e.button;
                    save();
                    event.reset(e);
                }
            }
        });
    });
};

