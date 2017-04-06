/// Content script main

var M = module.exports = {};

var
    preferences = require('../lib/preferences'),
    keyboard = require('../lib/keyboard'),
    event = require('../lib/event'),
    message = require('../lib/message'),
    dom = require('../lib/dom'),
    util = require('../lib/util'),

    capture = require('./capture'),
    infobox = require('./infobox'),
    selection = require('./selection'),
    table = require('./table'),
    loader = require('./loader')
;

var mouseButton = 0,
    currentCapture = null;

function parseEvent(evt) {

    var key = keyboard.key(evt),
        emod = preferences.int('modifier.extend'),
        mods = key.modifiers.code,
        kmods = mods & ~emod;

    if (preferences.val('capture.enabled') && preferences.val('_captureMode') && !kmods) {
        console.log('got capture', preferences.val('_captureMode'), mods & emod);
        return [preferences.val('_captureMode'), mods & emod];
    }

    if (!key.scan.code && kmods) {

        var cap = util.first(preferences.captureModes(), function (m) {
            return kmods === preferences.int('modifier.' + m.id);
        });

        if (cap) {
            console.log('got modifier', cap.id, mods & emod);
            return [cap.id, mods & emod];
        }
    }
}

function destroyCapture() {
    if (currentCapture) {
        currentCapture.stop();
        currentCapture = null;
    }
}

function captureDone(tbl) {
    table.selectCaptured(tbl);
    if (preferences.val('capture.reset')) {
        preferences.set('_captureMode', '').then(function () {
            message.background('preferencesUpdated');
        });
    }
}

function startCapture(evt, mode, extend) {
    var t = table.locate(evt.target);

    if (!t) {
        destroyCapture();
        return false;
    }

    if (currentCapture && currentCapture.table !== t.table) {
        destroyCapture();
        extend = false;
    }

    if (currentCapture) {
        currentCapture.stop();
    }

    currentCapture = currentCapture || new capture.Capture();

    currentCapture.onDone = captureDone;

    selection.start(evt.target);
    currentCapture.start(evt, mode, extend);
}

var copyLock = false,
    copyWaitTimeout = 300,
    copyWaitTimer = 0;

var eventListeners = {
    mousedownCapture: function (evt) {
        event.register(evt);

        if (evt.button !== mouseButton) {
            return;
        }

        var p = parseEvent(evt);
        console.log('parseEvent=', p);

        if (!p || !selection.selectable(evt.target)) {
            message.background('dropAllSelections');
            return;
        }

        startCapture(evt, p[0], p[1]);
    },

    copy: function (evt) {
        if (!copyLock)
            message.background('genericCopy');
    },

    contextmenu: function (evt) {
        event.register(evt);

        if (!selection.selectable(evt.target)) {
            message.background('dropAllSelections');
            message.background({name: 'contextMenu', selectable: false});
            return;
        }

        if (!selection.selected(evt.target)) {
            message.background({name: 'contextMenu', selectable: true, selected: false});
            return;
        }

        message.background({name: 'contextMenu', selectable: true, selected: true});
    }
};

var messageListeners = {
    dropSelection: function () {
        if (selection.table()) {
            selection.drop();
        }
    },

    preferencesUpdated: preferences.load,

    enumTables: function (msg) {
        return table.enum(selection.table());
    },

    selectTableByIndex: function (msg) {
        var tbl = table.byIndex(msg.index);
        if (tbl) {
            selection.select(tbl, 'table');
            tbl.scrollIntoView(true);
            infobox.update(selection.table());
        }
    },

    selectFromContextMenu: function (msg) {
        var el = event.lastTarget(),
            t = table.locate(el);

        if (t) {
            selection.toggle(t.td, msg.mode);
        } else if (msg.mode === 'table') {
            selection.toggle(dom.closest(el, 'table'), 'table');
        }

        infobox.update(selection.table());
    },

    tableIndexFromContextMenu: function () {
        var el = event.lastTarget(),
            tbl = dom.closest(el, 'table');
        return tbl ? table.indexOf(tbl) : null;
    },

    beginCopy: function () {
        copyLock = true;

        copyWaitTimer = setTimeout(function () {
            dom.attr(document.body, 'data-copytables-wait', 1);
        }, copyWaitTimeout);

        var tbl = selection.table();
        if (tbl) {
            table.copy(tbl);
            return true;
        }
        return false;
    },

    endCopy: function () {
        copyLock = false;
        clearTimeout(copyWaitTimer);
        dom.removeAttr(document.body, 'data-copytables-wait');
    }
};

function init() {
    event.listen(document, eventListeners);
    message.listen(messageListeners);
}

M.main = function () {
    loader.load().then(function () {
        if (!document.body) {
            console.log('no body', document.URL);
            return;
        }
        preferences.load().then(init);
    });
};
