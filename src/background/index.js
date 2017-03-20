/// Background script main

var M = module.exports = {};

var message = require('../lib/message'),
    util = require('../lib/util'),
    preferences = require('../lib/preferences'),

    menu = require('./menu'),
    commands = require('./commands'),
    helpers = require('./helpers')
    ;

var messageListeners = {

    dropAllSelections: function (msg) {
        message.allFrames('dropSelection');
    },

    dropOtherSelections: function (msg) {
        message.enumFrames('active').then(function (frames) {
            frames.forEach(function (frame) {
                if (frame.frameId !== msg.sender.frameId) {
                    message.frame('dropSelection', frame);
                }
            });
        });
    },

    contextMenu: function (msg) {
        helpers.enumTables().then(function (ts) {
            menu.enable(['selectRow', 'selectColumn', 'selectTable'], msg.selectable);
            menu.enable(['copy'], msg.selectable);
            menu.enable(['findPreviousTable', 'findNextTable'], ts.length > 0);
        });
    },

    genericCopy: function (msg) {
        commands.exec('copy', msg.sender);
    },

    preferencesUpdated: function (msg) {
        helpers.updateUI();
    },

    command: function (msg) {
        console.log('messageListeners.command', msg.sender)
        commands.exec(msg.command, msg.sender);
    }
};


function init() {
    menu.create();
    message.listen(messageListeners);

    chrome.contextMenus.onClicked.addListener(function (info, tab) {
        commands.exec(info.menuItemId, {tabId: tab.id, frameId: info.frameId});
    });

    chrome.commands.onCommand.addListener(function (cmd) {
        commands.exec(cmd, null);
    });

    helpers.updateUI();
}

M.main = function () {
    preferences.load().then(init);
};
