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
    frequency: 10,
    freq: 10
};

M.trackMouse = function (evt, fn, frequency, acceleration) {

    function watch() {
        fn(true, tracker.lastEvent);
        tracker.freq = Math.min(1000, tracker.freq * tracker.acceleration);
        tracker.timer = setTimeout(watch, 1000 / tracker.freq);
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
            fn(true, evt);

            clearTimeout(tracker.timer);
            tracker.freq = tracker.frequency;
            watch();
        },

        mouseup: function (evt) {
            reset();
            M.reset(evt);
            tracker.lastEvent = evt;
            fn(false, evt);
        }
    };

    if (tracker.active) {
        console.log('mouse tracker already active');
        reset();
    }

    tracker.active = true;
    tracker.frequency = frequency || 10;
    tracker.acceleration = acceleration || 1;
    console.log('mouse tracker started');

    M.listen(document, listeners);
    listeners.mousemove(evt);
};
