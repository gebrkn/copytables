/// Handle selecting cells with mouse

var M = module.exports = {};

var dom = require('../lib/dom'),
    cell = require('../lib/cell'),
    event = require('../lib/event'),
    message = require('../lib/message'),
    preferences = require('../lib/preferences'),
    util = require('../lib/util'),

    infobox = require('./infobox'),
    table = require('./table'),
    scroller = require('./scroller')
;

M.Capture = function () {
    this.anchorPoint = null;
    this.table = null;
};

M.Capture.prototype.markRect = function (evt) {
    var cx = evt.clientX,
        cy = evt.clientY;


    var p = this.scroller.adjustPoint(this.anchorPoint);

    var rect = [
        Math.min(cx, p.x),
        Math.min(cy, p.y),
        Math.max(cx, p.x),
        Math.max(cy, p.y)
    ];

    var big = 10e6;

    if (this.mode === 'column' || this.mode === 'table') {
        rect[1] = -big;
        rect[3] = +big;
    }

    if (this.mode === 'row' || this.mode === 'table') {
        rect[0] = -big;
        rect[2] = +big;
    }

    return rect;
};

M.Capture.prototype.setCaptured = function (rect) {
    dom.cells(this.table).forEach(function (td) {
        cell.unmark(td);
        if (util.intersect(dom.bounds(td).rect, rect)) {
            cell.mark(td);
        }
    });
};

M.Capture.prototype.setLocked = function (rect, canSelect) {
    dom.cells(this.table).forEach(function (td) {
        cell.unlock(td);
        if (util.intersect(dom.bounds(td).rect, rect)) {
            if (!canSelect) {
                cell.unselect(td);
                cell.lock(td);
            }
        }
    });
};

M.Capture.prototype.selection = function () {
    var self = this,
        tds = cell.findSelected(self.table);

    if (!self.selectedCells) {
        return [true, self.selectedCells = tds];
    }

    if (tds.length !== self.selectedCells.length) {
        return [true, self.selectedCells = tds];
    }

    var eq = true;

    tds.forEach(function (td, i) {
        eq = eq && td === self.selectedCells[i];
    });

    if (!eq) {
        return [true, self.selectedCells = tds];
    }

    return [false, self.selectedCells];
};


M.Capture.prototype.start = function (evt, mode, extend) {

    var t = table.locate(evt.target);

    this.table = t.table;
    this.scroller = new scroller.Scroller(t.td);
    this.mode = mode;
    this.extend = extend;

    if (!this.anchorPoint)
        extend = false;

    if (!extend) {
        this.anchorPoint = {
            x: dom.bounds(t.td).x + 1,
            y: dom.bounds(t.td).y + 1
        };
        this.setLocked(this.markRect(evt), !cell.selected(t.td));
    }

    var self = this;

    var tracker = function (mouseIsDown, evt) {
        self.scroller.scroll(evt);
        self.setCaptured(self.markRect(evt));
        infobox.update(self.table);

        if (!mouseIsDown) {
            self.onDone(self.table);
        }
    };

    event.trackMouse(evt,
        tracker,
        preferences.val('scroll.speed'),
        preferences.val('scroll.acceleration'));
};

M.Capture.prototype.stop = function () {
    dom.find('td, th').forEach(function (td) {
        cell.unmark(td);
        cell.unlock(td);
    });
};