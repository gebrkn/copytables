var M = module.exports = {};

var
    message = require('../lib/message'),
    preferences = require('../lib/preferences'),
    util = require('../lib/util'),

    menu = require('./menu'),
    copy = require('./copy'),
    helpers = require('./helpers')
;

function findTableCommand(direction, sender) {
    console.log('findTableCommand', direction, sender);

    if (!sender) {
        return helpers.findTable(direction);
    }

    message.frame('tableIndexFromContextMenu', sender).then(function (res) {
        if (res.data !== null) {
            helpers.findTable(direction, {tabId: sender.tabId, frameId: sender.frameId, index: res.data});
        } else {
            helpers.findTable(direction);
        }
    })
}

function copyCommand(format, sender) {
    var _ts = new Date();

    console.log('copyCommand', format, sender);

    message.allFrames('beginCopy').then(function (res) {
        res.some(function (r) {
            if (r.data) {
                copy.formats[format](r.receiver.url);
                return true;
            }
        });

        message.allFrames('endCopy');
        console.log('copyCommand: ' + ((new Date()) - _ts));
    });
};

function captureCommand(mode) {
    if (mode === 'off') {
        mode = '';
    }

    var m = preferences.val('_captureMode');
    if (m === mode) {
        preferences.set('_captureMode', '');
    } else {
        preferences.set('_captureMode', mode);
    }

    helpers.updateUI();
    message.allFrames('preferencesUpdated');
}

function selectCommand(mode, sender) {
    if (sender) {
        message.frame({name: 'selectFromContextMenu', mode: mode}, sender);
    }
}

M.exec = function (cmd, sender) {

    console.log('GOT COMMAND', cmd, sender);

    if (sender && typeof sender.tabId === 'undefined') {
        sender = null; // this comes from the popup
    }

    if (cmd === 'copy') {
        preferences.copyFormats().forEach(function (f) {
            if (f.default) {
                cmd = 'copy_' + f.id;
            }
        });
    }

    var m;

    m = cmd.match(/^copy_(\w+)/);
    if (m) {
        return copyCommand(m[1], sender);
    }

    m = cmd.match(/^capture_(\w+)/);
    if (m) {
        return captureCommand(m[1], sender);
    }

    m = cmd.match(/^select_(\w+)/);
    if (m) {
        return selectCommand(m[1], sender);
    }

    switch (cmd) {
        case 'find_next':
            return findTableCommand(+1, sender);
        case 'find_previous':
            return findTableCommand(-1, sender);
        case 'open_options':
            return chrome.runtime.openOptionsPage();
        case 'open_commands':
            return chrome.tabs.create({url: 'chrome://extensions/configureCommands'});
    }
};


