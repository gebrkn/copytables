/// Keyboard events and keys

var M = module.exports = {};

M.mac = navigator.userAgent.indexOf('Macintosh') > 0;
M.win = navigator.userAgent.indexOf('Windows') > 0;

M.modifiers = {
    SHIFT: 1 << 10,
    CTRL: 1 << 11,
    ALT: 1 << 12,
    META: 1 << 13
};

M.mouseModifiers = {};

if (M.mac)
    M.mouseModifiers = [M.modifiers.SHIFT, M.modifiers.ALT, M.modifiers.META];
else if (M.win)
    M.mouseModifiers = [M.modifiers.SHIFT, M.modifiers.ALT, M.modifiers.CTRL];
else
    M.mouseModifiers = [M.modifiers.SHIFT, M.modifiers.ALT, M.modifiers.CTRL, M.modifiers.META];


M.modNames = {};

M.modNames[M.modifiers.CTRL] = 'Ctrl';
M.modNames[M.modifiers.ALT] = M.mac ? 'Opt' : 'Alt';
M.modNames[M.modifiers.META] = M.mac ? 'Cmd' : (M.win ? 'Win' : 'Meta');
M.modNames[M.modifiers.SHIFT] = 'Shift';

M.modHTMLNames = {};

M.modHTMLNames[M.modifiers.CTRL] = M.mac ? '&#x2303; control' : M.modNames[M.modifiers.CTRL];
M.modHTMLNames[M.modifiers.ALT] = M.mac ? '&#x2325; option' : M.modNames[M.modifiers.ALT];
M.modHTMLNames[M.modifiers.META] = M.mac ? '&#x2318; command' : M.modNames[M.modifiers.META];
M.modHTMLNames[M.modifiers.SHIFT] = M.mac ? '&#x21E7; shift' : M.modNames[M.modifiers.SHIFT];


M.keyNames = {
    8: "Backspace",
    9: "Tab",
    13: "Enter",
    19: "Break",
    20: "Caps",
    27: "Esc",
    32: "Space",
    33: "PgUp",
    34: "PgDn",
    35: "End",
    36: "Home",
    37: "Left",
    38: "Up",
    39: "Right",
    40: "Down",
    45: "Ins",
    46: "Del",
    48: "0",
    49: "1",
    50: "2",
    51: "3",
    52: "4",
    53: "5",
    54: "6",
    55: "7",
    56: "8",
    57: "9",
    65: "A",
    66: "B",
    67: "C",
    68: "D",
    69: "E",
    70: "F",
    71: "G",
    72: "H",
    73: "I",
    74: "J",
    75: "K",
    76: "L",
    77: "M",
    78: "N",
    79: "O",
    80: "P",
    81: "Q",
    82: "R",
    83: "S",
    84: "T",
    85: "U",
    86: "V",
    87: "W",
    88: "X",
    89: "Y",
    90: "Z",
    93: "Select",
    96: "Num0",
    97: "Num1",
    98: "Num2",
    99: "Num3",
    100: "Num4",
    101: "Num5",
    102: "Num6",
    103: "Num7",
    104: "Num8",
    105: "Num9",
    106: "Num*",
    107: "Num+",
    109: "Num-",
    110: "Num.",
    111: "Num/",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    186: ";",
    187: "=",
    188: ",",
    189: "-",
    190: ".",
    191: "/",
    192: "`",
    219: "(",
    220: "\\",
    221: ")",
    222: "'",
};

M.keyCode = function (name) {
    var code;

    Object.keys(M.keyNames).some(function (c) {
        if (M.keyNames[c] === name) {
            return code = c;
        }
    });

    return code;
};

M.key = function (e) {
    var mods =
        (M.modifiers.ALT * e.altKey) |
        (M.modifiers.CTRL * e.ctrlKey) |
        (M.modifiers.META * e.metaKey) |
        (M.modifiers.SHIFT * e.shiftKey);

    var scan = e.keyCode,
        sname = M.keyNames[scan],
        mname = [],
        cname = [];

    Object.keys(M.modifiers).forEach(function (m) {
        if ((mods & M.modifiers[m])) {
            mname.push(M.modNames[M.modifiers[m]]);
        }
    });

    mname = mname.join(' ');

    var r = {
        modifiers: {code: 0, name: ''},
        scan: {code: 0, name: ''}
    };

    if (mname) {
        r.modifiers = {code: mods, name: mname};
        cname.push(mname);
    }

    if (sname) {
        r.scan = {code: scan, name: sname};
        cname.push(sname);
    }

    r.code = mods | scan;
    r.name = cname.join(' ');

    return r;
};
