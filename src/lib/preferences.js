// Preferences, stored in chrome.storage

var M = module.exports = {};

var keyboard = require('./keyboard'),
    message = require('./message');

var firstMod = keyboard.modifiers.ALT,
    secondMod = keyboard.mac ? keyboard.modifiers.META : keyboard.modifiers.CTRL;

var defaults = {
    'mouse.cell': 0,
    'mouse.column': 0,
    'mouse.row': 0,
    'mouse.table': 1,
    'mouse.extend': 0,

    'modifier.cell': firstMod,
    'modifier.column': 0,
    'modifier.row': 0,
    'modifier.table': 0,
    'modifier.extend': keyboard.modifiers.SHIFT,

    'capture.enabled': true,
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
    'copy.format.enabled.TextTabs': true,

    'infobar.enabled': true,
    'infobar.sticky': true
};

var copyFormats = require('./formats');

var infoFunctions = [
    {
        id: 'count',
        name: 'count',
    },
    {
        id: 'sum',
        name: 'sum',
    },
    {
        id: 'avg',
        name: 'average'
    },
    {
        id: 'min',
        name: 'min'
    },
    {
        id: 'max',
        name: 'max'
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