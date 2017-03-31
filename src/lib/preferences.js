// Preferences, stored in chrome.storage

var M = module.exports = {};

var keyboard = require('./keyboard'),
    message = require('./message');

var firstMod = keyboard.modifiers.ALT,
    secondMod = keyboard.mac ? keyboard.modifiers.META : keyboard.modifiers.CTRL;

var defaults = {
    'modifier.cell': firstMod,
    'modifier.column': 0,
    'modifier.row': 0,
    'modifier.table': 0,
    'modifier.extend': keyboard.modifiers.SHIFT,

    'capture.enabled': true,
    'capture.reset': false,

    'scroll.speed': 300,
    'scroll.acceleration': 30,

    'copy.format.enabled.richHTML': true,
    'copy.format.enabled.richHTMLCSS': true,
    'copy.format.enabled.textCSV': true,
    'copy.format.enabled.textCSVSwap': true,
    'copy.format.enabled.textHTML': true,
    'copy.format.enabled.textHTMLCSS': true,
    'copy.format.enabled.textTabs': true,
    'copy.format.enabled.textTabsSwap': true,

    'copy.format.default.richHTML': true,

    'infobox.enabled': true
};

var captureModes = [
    {
        id: 'zzz',
        name: 'Off'
    },
    {
        id: 'cell',
        name: 'Cells'
    },
    {
        id: 'column',
        name: 'Columns'
    },
    {
        id: 'row',
        name: 'Rows'
    },
    {
        id: 'table',
        name: 'Tables'
    }
];

var copyFormats = [
    {
        "id": "richHTMLCSS",
        "name": "As is",
        "desc": "Copy the table as seen on the screen (to insert into a Word document)"
    },
    {
        "id": "richHTML",
        "name": "Plain Table",
        "desc": "Copy the table without formatting"
    },
    {
        "id": "textTabs",
        "name": "Text",
        "desc": "Copy as tab-delimited text"
    },
    {
        "id": "textTabsSwap",
        "name": "Text+Swap",
        "desc": "Copy as tab-delimited text, swap columns and rows"
    },
    {
        "id": "textCSV",
        "name": "CSV",
        "desc": "Copy as comma-separated text"
    },
    {
        "id": "textCSVSwap",
        "name": "CSV+Swap",
        "desc": "Copy as comma-separated text, swap columns and rows"
    },
    {
        "id": "textHTMLCSS",
        "name": "HTML+CSS",
        "desc": "Copy as HTML source, retain formatting"
    },
    {
        "id": "textHTML",
        "name": "HTML",
        "desc": "Copy as HTML source, without formatting"
    },
];

var infoFunctions = [
    {
        id: 'count',
        name: 'Count',
    },
    {
        id: 'sum',
        name: 'Sum',
    },
    {
        id: 'avg',
        name: 'Average'
    },
    {
        id: 'min',
        name: 'Min value'
    },
    {
        id: 'max',
        name: 'Max value'
    }
];

var prefs = {};

M.load = function () {
    return new Promise(function (resolve) {
        chrome.storage.local.get(null, function (obj) {
            obj = obj || {};

            // from the previous version
            if('modKey' in obj && String(obj.modKey) === '1') {
                console.log('FOUND ALTERNATE MODKEY SETTING');
                obj['modifier.cell'] = secondMod;
                delete obj.modKey;
            }

            prefs = Object.assign({}, defaults, prefs, obj);
            console.log('PREFS LOAD', prefs);
            resolve(prefs);
        });
    });
};

M.save = function () {
    return new Promise(function (resolve) {
        chrome.storage.local.clear();
        chrome.storage.local.set(prefs, function () {
            console.log('PREFS SET', prefs);
            resolve(prefs);
        });
    });
};

M.setAll = function (obj) {
    prefs = Object.assign({}, prefs, obj);
    return M.save();
};

M.set = function (key, val) {
    prefs[key] = val;
    return M.save();
};

M.val = function (key) {
    return prefs[key];
};

M.int = function (key) {
    return Number(M.val(key)) || 0;
};

M.copyFormats = function () {
    return copyFormats.map(function (f) {
        f.enabled = !!M.val('copy.format.enabled.' + f.id);
        f.default = !!M.val('copy.format.default.' + f.id);
        return f;
    });
};

M.infoFunctions = function() {
    return infoFunctions;
};

M.captureModes = function() {
    return captureModes;
};
