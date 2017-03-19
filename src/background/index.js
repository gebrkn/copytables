var M = module.exports = {};

var message = require('../lib/message'),
    menu = require('./menu'),
    commands = require('./commands'),
    helpers = require('./helpers'),
    util = require('../lib/util'),
    preferences = require('../lib/preferences')
    ;


var messageListeners = {};

messageListeners.dropAllSelections = function (msg) {
    message.allFrames('dropSelection');
};

messageListeners.dropOtherSelections = function (msg) {
    message.enumFrames('active').then(function (frames) {
        frames.forEach(function (frame) {
            if (frame.frameId !== msg.sender.frameId) {
                message.frame('dropSelection', frame);
            }
        });
    });
};

messageListeners.contextMenu = function (msg) {
    helpers.enumTables().then(function (ts) {
        menu.enable(['selectRow', 'selectColumn', 'selectTable'], msg.selectable);
        menu.enable(['copy'], msg.selectable);
        menu.enable(['findPreviousTable', 'findNextTable'], ts.length > 0);
    });
};

messageListeners.genericCopy = function (msg) {
    commands.exec('copy', msg.sender);
};

messageListeners.preferencesUpdated = helpers.preferencesUpdated;

messageListeners.command = function (msg) {
    console.log('messageListeners.command', msg.sender)
    commands.exec(msg.command, msg.sender);
};

//

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
