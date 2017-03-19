// Preferences, stored in chrome.storage

var M = module.exports = {};

var keyboard = require('./keyboard'),
    message = require('./message');

var defaults = {
    'mouse.cell': 0,
    'mouse.column': 0,
    'mouse.row': 0,
    'mouse.table': 1,
    'mouse.extend': 0,

    'modifier.cell': keyboard.modifiers.ALT,
    'modifier.column': keyboard.modifiers.META,
    'modifier.row': keyboard.modifiers.META | keyboard.modifiers.ALT,
    'modifier.table': 0,
    'modifier.extend': keyboard.modifiers.SHIFT,

    'capture.enabled': false,
    'capture.reset': false,

    'scroll.speed': 50,

    'copy.format.default.RichHTML': false,
    'copy.format.default.RichHTMLCSS': true,
    'copy.format.default.TextCSV': false,
    'copy.format.default.TextHTML': false,
    'copy.format.default.TextHTMLCSS': false,
    'copy.format.default.TextTabs': false,

    'copy.format.enabled.RichHTML': true,
    'copy.format.enabled.RichHTMLCSS': true,
    'copy.format.enabled.TextCSV': true,
    'copy.format.enabled.TextHTML': true,
    'copy.format.enabled.TextHTMLCSS': true,
    'copy.format.enabled.TextTabs': true
};

var copyFormats = [
    {
        id: 'RichHTMLCSS',
        name: 'Verbatim'
    },
    {
        id: 'RichHTML',
        name: 'Structured'
    },
    {
        id: 'TextTabs',
        name: 'Text-only'
    },
    {
        id: 'TextCSV',
        name: 'CSV'
    },
    {
        id: 'TextHTML',
        name: 'HTML'
    },
    {
        id: 'TextHTMLCSS',
        name: 'HTML+CSS'
    }
];

var prefs = {};

M.load = function () {
    return new Promise(function (resolve) {
        chrome.storage.local.get(null, function (obj) {
            prefs = Object.assign({}, defaults, prefs, obj || {});
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
