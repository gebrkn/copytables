var M = module.exports = {};

var preferences = require('../lib/preferences');

var mainMenu = {
    id: 'root',
    title: 'Table...',
    children: [
        {
            id: 'selectRow',
            title: 'Select Row'
        },
        {
            id: 'selectColumn',
            title: 'Select Column'
        },
        {
            id: 'selectTable',
            title: 'Select Table'
        },
        '---',
        {
            id: 'findPreviousTable',
            title: 'Previous Table'
        },
        {
            id: 'findNextTable',
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
                id: 'copy' + f.id,
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

    })
};
