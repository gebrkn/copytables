/// Background script main

var M = module.exports = {};

var message = require('../lib/message'),
    util = require('../lib/util'),
    preferences = require('../lib/preferences'),

    menu = require('./menu'),
    commands = require('./commands'),
    copy = require('./copy'),
    notification = require('./notification'),
    helpers = require('./helpers')
;

notification.listen(function(e) {
    if(e.id === 'infoBox' && e.type === 'buttonClicked' && e.options) {
        switch(e.button) {
            case 0:
                copy.textCopy(e.options.items.map(function(item) {
                    return item.title + '\t' + item.message;
                }).join('\n'));
                break;
            case 1:
                notification.hide();
                preferences.set('infobox.enabled', false);
                message.broadcast('preferencesUpdated');
                break;
        }
    }
});


var messageListeners = {

    dropAllSelections: function (msg) {
        message.allFrames('dropSelection');
    },

    showInfoBox: function (msg) {
        var opts = {
            type: 'list',
            iconUrl: 'ico38.png',
            title: 'Selection information',
            message: '',
            items: msg.data,
            buttons: [
                {title: 'Copy'},
                {title: 'Disable'}
            ]
        };

        notification.show('infoBox', msg.data ? opts : null);
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
            menu.enable(['select_row', 'select_column', 'select_table'], msg.selectable);
            menu.enable(['copy'], msg.selectable);
            menu.enable(['find_previous', 'find_next'], ts.length > 0);
        });
    },

    genericCopy: function (msg) {
        commands.exec('copy', msg.sender);
    },

    preferencesUpdated: function (msg) {
        helpers.updateUI();
        message.broadcast('preferencesUpdated');
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
