var M = module.exports = {};

var preferences = require('../lib/preferences');

var mainMenu = {
    id: 'root',
    title: 'Table...',
    children: [
        {
            id: 'select_row',
            title: 'Select Row'
        },
        {
            id: 'select_column',
            title: 'Select Column'
        },
        {
            id: 'select_table',
            title: 'Select Table'
        },
        '---',
        {
            id: 'find_previous',
            title: 'Previous Table'
        },
        {
            id: 'find_next',
            title: 'Next Table'
        },
        '---',
        {
            id: 'copy',
            title: 'Copy'
        },
        {
            id: 'copyAs',
            title: 'Copy As...'
        }
    ]
};

var uid = 0;

function createMenu(menu, parent) {
    var desc = {
        enabled: true,
        contexts: ['page', 'selection', 'link', 'editable']
    };

    if (parent) {
        desc.parentId = parent;
    }

    if (menu === '---') {
        desc.id = 'uid' + (++uid);
        desc.type = 'separator';
    } else {
        desc.id = menu.id;
        desc.title = menu.title;
    }

    var sub = menu.children;

    if(menu.id === 'copyAs') {
        var cf = preferences.copyFormats().filter(function(f) {
            return f.enabled;
        });

        if(!cf.length) {
            return;
        }

        sub = cf.map(function(f) {
            return {
                id: 'copy_' + f.id,
                title: f.name,
            }
        });
    }

    var mobj = chrome.contextMenus.create(desc);

    if (sub) {
        sub.forEach(function (subMenu) {
            createMenu(subMenu, mobj);
        });
    }

    return mobj;
}

M.create = function () {
    chrome.contextMenus.removeAll(function () {
        createMenu(mainMenu);
    });
};

M.enable = function (ids, enabled) {
    ids.forEach(function (id) {
        chrome.contextMenus.update(id, {enabled: enabled});
        if(id === 'copy') {
            var cf = preferences.copyFormats().filter(function(f) {
                return f.enabled;
            });
            cf.forEach(function(f) {
                chrome.contextMenus.update('copy_' + f.id, {enabled: enabled});
            });
        }
    });
};
