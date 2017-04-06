/// Basic events library

var M = module.exports = {};

var lastEvent = null;

M.register = function (evt) {
    lastEvent = evt;
};

M.last = function () {
    return lastEvent;
};

M.lastTarget = function () {
    return lastEvent ? lastEvent.target : null;
};

M.reset = function (evt) {
    evt.stopPropagation();
    evt.preventDefault();
};

M.listen = function (target, listeners) {
    Object.keys(listeners).forEach(function (key) {
        var m = key.match(/^(\w+?)(Capture)?$/);
        (target || document).addEventListener(m[1], listeners[key], !!m[2]);
    });
};

M.unlisten = function (target, listeners) {
    Object.keys(listeners).forEach(function (key) {
        var m = key.match(/^(\w+?)(Capture)?$/);
        (target || document).removeEventListener(m[1], listeners[key], !!m[2]);
    });
};

var tracker = {
    active: false,
    lastEvent: null,
    timer: 0,
    freq: 5
};

M.trackMouse = function (evt, fn) {

    function watch() {
        fn('tick', tracker.lastEvent);
        tracker.timer = setTimeout(watch, tracker.freq);
    }

    function reset() {
        clearInterval(tracker.timer);
        tracker.active = false;
        M.unlisten(document, listeners);
    }

    var listeners = {

        mousemove: function (evt) {
            M.reset(evt);
            tracker.lastEvent = evt;

            if(evt.buttons === 1) {
                clearTimeout(tracker.timer);
                fn('move', tracker.lastEvent);
                watch();
            } else {
                reset();
                fn('up', evt);
            }
        },

        mouseup: function (evt) {
            M.reset(evt);
            tracker.lastEvent = evt;
            reset();
            fn('up', evt);
        }
    };

    if (tracker.active) {
        console.log('mouse tracker already active');
        reset();
    }

    tracker.active = true;
    console.log('mouse tracker started');

    M.listen(document, listeners);
    listeners.mousemove(evt);
};
