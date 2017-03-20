/// Basic DOM library

var M = module.exports = {};

function toArray(coll) {
    return Array.prototype.slice.call(coll || [], 0);
}

function each(coll, fn) {
    Array.prototype.forEach.call(coll || [], fn);
}

M.is = function(el, sel) {
    return el && el.matches && el.matches(sel);
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
    if (!el) {
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
    if (el) {
        el.removeAttribute(name);
    }
};

M.findSelf = function (sel, where) {
    return [where || document].concat(toArray(M.find(sel, where)));
};

M.cells = function (tbl) {
    var ls = [];

    each(tbl.rows, function (tr) {
        each(tr.cells, function (td) {
            ls.push(td);
        });
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
