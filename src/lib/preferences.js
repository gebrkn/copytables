// Preferences, stored in chrome.storage

var M = module.exports = {};

var keyboard = require('./keyboard'),
    message = require('./message');

var firstMod = keyboard.modifiers.ALT,
    secondMod = keyboard.mac ? keyboard.modifiers.META : keyboard.modifiers.CTRL;

var defaults = {
    'modifier.cell': firstMod,
    'modifier.column': firstMod | secondMod,
    'modifier.row': 0,
    'modifier.table': 0,
    'modifier.extend': keyboard.modifiers.SHIFT,

    'capture.enabled': true,
    'capture.reset': false,

    'scroll.amount': 30,
    'scroll.acceleration': 5,

    'copy.format.enabled.richHTML': true,
    'copy.format.enabled.richHTMLCSS': true,
    'copy.format.enabled.textCSV': true,
    'copy.format.enabled.textCSVSwap': true,
    'copy.format.enabled.textHTML': true,
    'copy.format.enabled.textHTMLCSS': true,
    'copy.format.enabled.textTabs': true,
    'copy.format.enabled.textTabsSwap': true,
    'copy.format.enabled.textTextile': true,

    'copy.format.default.richHTMLCSS': true,

    'infobox.enabled': true,
    'infobox.position': '0'
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
        "desc": "Copy the table as seen on the screen"
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
    {
        "id": "textTextile",
        "name": "Textile",
        "desc": "Copy as Textile (Text content)"
    },
    {
        "id": "textTextileHTML",
        "name": "Textile+HTML",
        "desc": "Copy as Textile (HTML content)"
    },
];

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

function _constrain (min, val, max) {
    val = Number(val) || min;
    return Math.max(min, Math.min(val, max));
}

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

            prefs['scroll.amount'] = _constrain(1, prefs['scroll.amount'], 100);
            prefs['scroll.acceleration'] = _constrain(0, prefs['scroll.acceleration'], 100);

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
