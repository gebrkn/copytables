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
    util.callChrome('browserAction.setBadgeText', {text: s})
    util.callChrome('browserAction.setBadgeBackgroundColor', {color: badgeColor});
};

M.updateBadge = function () {
    var mode = preferences.val('_captureMode');

    console.log('updateBadge mode=' + mode);

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
            all = all.concat((r.data || []).map(function (t) {
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


    M.enumTables().then(function(allTables) {

        if (!allTables.length) {
            return;
        }

        var curr = -1;

        allTables.some(function (t, n) {
            if (start && t.frame.frameId == start.frameId && t.frame.tabId === start.tabId && t.index === start.index) {
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
        message.frame({'name': 'selectTableByIndex', index: t.index}, t.frame);
    });
};
