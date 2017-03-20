/// Content script main

var M = module.exports = {};

var
    preferences = require('../lib/preferences'),
    keyboard = require('../lib/keyboard'),
    event = require('../lib/event'),
    message = require('../lib/message'),
    dom = require('../lib/dom'),
    util = require('../lib/util'),

    table = require('./table'),
    selection = require('./selection'),
    capture = require('./capture'),
    loader = require('./loader')
    ;

var mouseButton = 0,
    captureModes = ['cell', 'column', 'row', 'table'],
    currentCapture = null;

function parseEvent(evt) {

    var key = keyboard.key(evt),
        emod = preferences.int('modifier.extend'),
        mods = key.modifiers.code,
        kmods = mods & ~emod;

    if (!key.scan.code && mods) {

        var cap = util.first(captureModes, function (m) {
            return kmods === preferences.int('modifier.' + m);
        });

        if (cap) {
            console.log('got modifier', cap, mods & emod)
            return [cap, mods & emod];
        }
    }

    if (preferences.val('_captureMode') && !kmods) {
        console.log('got capture', preferences.val('_captureMode'), mods & emod);
        return [preferences.val('_captureMode'), mods & emod];
    }
}

function destroyCapture() {
    if (currentCapture) {
        currentCapture.stop();
        currentCapture = null;
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

    currentCapture = currentCapture || new capture.Capture();
    console.log('currentCapture', currentCapture)

    currentCapture.onDone = function (tbl) {
        table.selectCaptured(tbl);
        currentCapture.stop();
    };

    selection.start(evt.target);
    currentCapture.start(evt, mode, extend);
}

var eventListeners = {
    mousedownCapture: function (evt) {
        event.register(evt);

        if (evt.button !== mouseButton) {
            return;
        }

        var p = parseEvent(evt);
        console.log('parseEvent=', p)

        if (!p || !selection.selectable(evt.target)) {
            message.background('dropAllSelections');
            return;
        }

        startCapture(evt, p[0], p[1]);

    },

    copy: function (evt) {
        message.background('genericCopy');
    },

    contextmenu: function (evt) {
        event.register(evt);

        if (!selection.selectable(evt.target)) {
            message.background('dropAllSelections')
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
    dropSelection: selection.drop,
    preferencesUpdated: preferences.load,

    enumTables: function (msg) {
        return table.enum(selection.table());
    },

    selectTableByIndex: function (msg) {
        var tbl = table.byIndex(msg.index);
        if (tbl) {
            selection.select(tbl, 'table');
            tbl.scrollIntoView(true);
        }
    },

    selectFromContextMenu: function (msg) {
        var t = table.locate(event.lastTarget());
        if (t) {
            selection.toggle(t.td, msg.mode);
        }
    },

    tableIndexFromContextMenu: function () {
        var t = table.locate(event.lastTarget());
        return t ? table.indexOf(t.table) : null;
    },

    contentFromContextMenu: function () {
        var t = table.locate(event.lastTarget());
        return t ? table.rawContent(t.table) : null;
    },

    contentFromSelection: function () {
        var tbl = selection.table();
        return tbl ? table.rawContent(tbl) : null;
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
