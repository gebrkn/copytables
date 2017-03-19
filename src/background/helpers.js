var M = module.exports = {};

var message = require('../lib/message'),
    preferences = require('../lib/preferences'),
    util = require('../lib/util'),
    menu = require('./menu')
    ;

var badgeColor = '#1e88ff';

M.updateUI = function () {
    preferences.load().then(function () {
        menu.create();
        M.updateBadge();
    });
};

M.setBadge = function (s) {
    chrome.browserAction.setBadgeText({text: s})
    chrome.browserAction.setBadgeBackgroundColor({color: badgeColor});
};

M.updateBadge = function () {
    var mode = preferences.val('_captureMode');

    console.log('mode=' + mode);

    switch(mode) {
        case 'column':
            return M.setBadge('C');
        case 'row':
            return M.setBadge('R');
        case 'cell':
            return M.setBadge('E');
        case 'table':
            return M.setBadge('T');
        default:
            M.setBadge('');
    }
};

M.enumTables = function () {
    return message.allFrames('enumTables').then(function (res) {
        var all = [];

        res.forEach(function (r) {
            all = all.concat(r.data.map(function (t) {
                t.frame = {
                    tabId: r.receiver.tabId,
                    frameId: r.receiver.frameId
                };
                return t;
            }));
        });

        return all.sort(function (a, b) {
            return a.frame.frameId - b.frame.frameId || a.index - b.index;
        });
    });
};

M.findTable = function (direction, start) {

    message.allFrames('enumTables').then(function (res) {

        var allTables = util.flatten(res.map(function (r) {
            return r.data.map(function (t) {
                t.tabId = r.receiver.tabId;
                t.frameId = r.receiver.frameId;
                return t;
            });
        }));

        console.log('ALL_TABLES', allTables, start)

        if (!allTables.length) {
            return;
        }

        allTables.sort(function (a, b) {
            return a.frameId - b.frameId || a.index - b.index;
        });

        var curr = -1;

        allTables.some(function (t, n) {
            if (start && t.frameId == start.frameId && t.tabId === start.tabId && t.index === start.index) {
                curr = n;
                return true;
            }
            if (!start && t.selected) {
                curr = n;
                return true;
            }
        });

        if (direction === +1) {
            if (curr === -1 || curr === allTables.length - 1)
                curr = 0;
            else
                curr += 1;
        } else {
            if (curr === -1 || curr === 0)
                curr = allTables.length - 1;
            else
                curr--;
        }

        var t = allTables[curr];
        message.frame({'name': 'selectNthTable', index: t.index}, t);
    });
};
