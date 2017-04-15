/// Basic DOM library

var M = module.exports = {};

function toArray(coll) {
    return Array.prototype.slice.call(coll || [], 0);
}

function each(coll, fn) {
    Array.prototype.forEach.call(coll || [], fn);
}

M.is = function (el, sel) {
    return el && el.matches && el.matches(sel);
};

M.visible = function (el) {
    return el && !!(el.offsetHeight || el.offsetWidth);
};

M.findOne = function (sel, where) {
    return (where || document).querySelector(sel);
};

M.find = function (sel, where) {
    return (where || document).querySelectorAll(sel);
};

M.indexOf = function (el, sel, where) {
    var idx = -1;
    M.find(sel, where).forEach(function (e, n) {
        if (e === el) {
            idx = n;
        }
    });
    return idx;
};

M.nth = function (n, sel, where) {
    return M.find(sel, where).item(n)
};

M.attr = function (el, name, value) {
    if (!el || !el.getAttribute) {
        return null;
    }
    if (arguments.length === 2) {
        return el.getAttribute(name);
    }
    if (value === null) {
        return el.removeAttribute(name);
    }
    return el.setAttribute(name, value);
};

M.removeAttr = function (el, name) {
    if (el && el.removeAttribute) {
        el.removeAttribute(name);
    }
};

M.findSelf = function (sel, where) {
    return [where || document].concat(toArray(M.find(sel, where)));
};

M.rows = function (tbl) {
    if (tbl && tbl.rows) {
        return toArray(tbl.rows);
    }
    return [];
};

M.cells = function (tbl) {
    var ls = [];

    M.rows(tbl).forEach(function (tr) {
        ls = ls.concat(tr.cells);
    });

    return ls;
};

M.remove = function (els) {
    els.forEach(function (el) {
        if (el && el.parentNode)
            el.parentNode.removeChild(el);
    });
};

M.closest = function (el, sel) {
    while (el && el.matches) {
        if (el.matches(sel))
            return el;
        el = el.parentNode;
    }
    return null;
};

M.contains = function (parent, el) {
    while (el) {
        if (el === parent)
            return true;
        el = el.parentNode;
    }
    return false;
};

// Get element's bounds.
M.bounds = function (el) {
    var r = el.getBoundingClientRect();
    return {
        x: r.left,
        y: r.top,
        right: r.right,
        bottom: r.bottom,
        rect: [r.left, r.top, r.right, r.bottom]
    };
};

// Get element's viewport offset.
M.offset = function (el) {
    var r = {x: 0, y: 0};
    while (el) {
        r.x += el.offsetLeft;
        r.y += el.offsetTop;
        el = el.offsetParent;
    }
    return r;
};

M.addClass = function (el, cls) {
    return el && el.classList && el.classList.add(cls);
};

M.removeClass = function (el, cls) {
    return el && el.classList && el.classList.remove(cls);
};

M.hasClass = function (el, cls) {
    return el && el.classList && el.classList.contains(cls);
};

M.textContent = function (node) {
    var c = [];

    function walk(n) {
        if (!n)
            return;

        if (n.nodeType === 3) {
            var t = (n.textContent || '').trim();
            if (t.length)
                c.push(t);
            return;
        }

        if (!M.visible(n)) {
            return;
        }

        (n.childNodes || []).forEach(walk);
    }

    walk(node);
    return c;
};

M.deselect = function () {
    var selection = window.getSelection();
    selection.removeAllRanges();
};

M.select = function (el) {
    var range = document.createRange(),
        selection = window.getSelection();

    range.selectNodeContents(el);
    selection.removeAllRanges();
    selection.addRange(range);
};
