// Preferences, stored in chrome.storage

var M = module.exports = {};

var keyboard = require('./keyboard'),
    number = require('./number'),
    util = require('./util');

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
    'copy.format.enabled.textCSVTranspose': true,
    'copy.format.enabled.textHTML': true,
    'copy.format.enabled.textHTMLCSS': true,
    'copy.format.enabled.textTabs': true,
    'copy.format.enabled.textTabsTranspose': true,
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
        "id": "textTabsTranspose",
        "name": "Text+Transpose",
        "desc": "Copy as tab-delimited text, transpose columns and rows"
    },
    {
        "id": "textCSV",
        "name": "CSV",
        "desc": "Copy as comma-separated text"
    },
    {
        "id": "textCSVTranspose",
        "name": "CSV+Transpose",
        "desc": "Copy as comma-separated text, transpose columns and rows"
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

function sum(vs) {
    return vs.reduce(function (x, y) {
        return x + (Number(y) || 0)
    }, 0);
}

function getNumbers(values) {
    var vs = [];

    values.forEach(function (v) {
        if (v.isNumber)
            vs.push(v.number);
    });

    return vs.length ? vs : null;
}

var infoFunctions = [
    {
        name: 'count',
        fn: function (values) {
            return values.length;
        }
    },
    {
        name: 'sum',
        fn: function (values) {
            var vs = getNumbers(values);
            return vs ? number.format(sum(vs)) : null;
        }
    },
    {
        name: 'average',
        fn: function (values) {
            var vs = getNumbers(values);
            return vs ? number.format(sum(vs) / vs.length, 2) : null;
        }
    },
    {
        name: 'min',
        fn: function (values) {
            var vs = getNumbers(values);
            return vs ? number.format(Math.min.apply(Math, vs)) : null;
        }
    },
    {
        name: 'max',
        fn: function (values) {
            var vs = getNumbers(values);
            return vs ? number.format(Math.max.apply(Math, vs)) : null;
        }
    }
];

var prefs = {};

function _constrain(min, val, max) {
    val = Number(val) || min;
    return Math.max(min, Math.min(val, max));
}

M.load = function () {
    return util.callChromeAsync('storage.local.get', null)
        .then(function (obj) {
            obj = obj || {};

            // from the previous version
            if ('modKey' in obj && String(obj.modKey) === '1') {
                console.log('FOUND ALTERNATE MODKEY SETTING');
                obj['modifier.cell'] = secondMod;
                delete obj.modKey;
            }

            prefs = Object.assign({}, defaults, prefs, obj);

            prefs['scroll.amount'] = _constrain(1, prefs['scroll.amount'], 100);
            prefs['scroll.acceleration'] = _constrain(0, prefs['scroll.acceleration'], 100);

            if (!prefs['number.group']) {
                prefs['number.group'] = number.defaultFormat().group;
            }

            if (!prefs['number.decimal']) {
                prefs['number.decimal'] = number.defaultFormat().decimal;
            }

            console.log('PREFS LOAD', prefs);
            return prefs;
        });
};

M.save = function () {
    return util.callChromeAsync('storage.local.clear')
        .then(function () {
            return util.callChromeAsync('storage.local.set', prefs);
        }).then(function () {
            console.log('PREFS SET', prefs);
            return prefs;
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

M.numberFormat = function () {
    var g = M.val('number.group');
    var d = M.val('number.decimal');

    if (!g && !d) {
        return number.defaultFormat();
    }

    return {
        group: g || '',
        decimal: d || '',
    };
}

M.infoFunctions = function () {
    return infoFunctions;
};

M.captureModes = function () {
    return captureModes;
};
