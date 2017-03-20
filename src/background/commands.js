var M = module.exports = {};

var
    message = require('../lib/message'),
    preferences = require('../lib/preferences'),
    util = require('../lib/util'),

    menu = require('./menu'),
    copy = require('./copy'),
    content = require('./content'),
    helpers = require('./helpers')
    ;

function findTableCommand(direction, sender) {
    console.log('findTableCommand', sender)

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
};

function copyCommand(format, sender) {
    message.allFrames('contentFromSelection').then(function (res) {

        var data = res.map(function (r) {
            return r.data;
        }).filter(Boolean);

        if (data.length) {
            var d = content.prepare(data[0], true);
            return copy[format](d);
        }
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

    if(sender && typeof sender.tabId === 'undefined') {
        sender = null; // this comes from the popup
    }

    if (cmd === 'copy') {
        preferences.copyFormats().forEach(function (f) {
            if (f.default) {
                cmd = 'copy' + f.id;
            }
        });
    }

    var m = cmd.match(/^copy(\w+)/);
    if (m) {
        return copyCommand(m[1], sender);
    }

    var m = cmd.match(/^capture(\w+)/);
    if (m) {
        return captureCommand(m[1].toLowerCase(), sender);
    }

    var m = cmd.match(/^select(\w+)/);
    if (m) {
        return selectCommand(m[1].toLowerCase(), sender);
    }

    switch (cmd) {
        case 'findNextTable':
            return findTableCommand(+1, sender);
        case 'findPreviousTable':
            return findTableCommand(-1, sender);
        case 'openOptionsPage':
            return chrome.runtime.openOptionsPage();
        case 'openConfigureCommands':
            return chrome.tabs.create({url: 'chrome://extensions/configureCommands'});
    }
};


