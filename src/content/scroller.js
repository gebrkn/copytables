var M = module.exports = {};

var dom = require('../lib/dom'),
    event = require('../lib/event'),
    preferences = require('../lib/preferences');

function isScrollable(el) {
    var css = window.getComputedStyle(el);
    if (!css.overflowX.match(/scroll|auto/) && !css.overflowY.match(/scroll|auto/))
        return false;
    return el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight;
}

function closestScrollable(el) {
    while (el && el !== document.body && el !== document.documentElement) {
        if (isScrollable(el))
            return el;
        el = el.parentNode;
    }
    return null;
}

function position(base) {
    return base
        ? {x: base.scrollLeft, y: base.scrollTop}
        : {x: window.scrollX, y: window.scrollY};

};

M.Scroller = function(el) {
    this.base = closestScrollable(el.parentNode),
    this.anchor = position(this.base);
    this.reset();
};

M.Scroller.prototype.reset = function() {
    this.amount = preferences.int('scroll.amount');
    this.acceleration = preferences.int('scroll.acceleration');
};

M.Scroller.prototype.adjustPoint = function (pt) {
    var p = position(this.base);
    return {
        x: pt.x + this.anchor.x - p.x,
        y: pt.y + this.anchor.y - p.y
    }
};

M.Scroller.prototype.scroll = function (e) {

    function adjust(a, sx, sy, ww, hh, cx, cy) {
        if (cx < a)      sx -= a;
        if (cx > ww - a) sx += a;
        if (cy < a)      sy -= a;
        if (cy > hh - a) sy += a;
        return {x: sx, y: sy};
    }

    if (this.base) {

        var b = dom.bounds(this.base);
        var p = adjust(
            this.amount,
            this.base.scrollLeft,
            this.base.scrollTop,
            this.base.clientWidth,
            this.base.clientHeight,
            e.clientX - b.x,
            e.clientY - b.y
        );

        this.base.scrollLeft = p.x;
        this.base.scrollTop = p.y;

    } else {

        var p = adjust(
            this.amount,
            window.scrollX,
            window.scrollY,
            window.innerWidth,
            window.innerHeight,
            e.clientX,
            e.clientY
        );

        if (p.x != window.scrollX || p.y != window.scrollY) {
            window.scrollTo(p.x, p.y);
        }
    }

    this.amount = Math.max(1, Math.min(100, this.amount + this.amount * (this.acceleration / 100)));
};
