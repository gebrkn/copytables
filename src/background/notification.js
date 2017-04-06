/// Wrapper for chrome.notfications

var M = module.exports = {};

var frequency = 500,
    pending = null,
    timer = 0,
    last = null;


function show() {
    if (pending) {
        if (pending.options) {
            chrome.notifications.create(pending.id, pending.options);
            last = pending;
        } else {
            chrome.notifications.clear(pending.id);
            last = null;
        }
        pending = null;

    } else if (timer) {
        clearTimeout(timer);
        timer = 0;
        console.log('notification: no more');
    }
}

M.show = function (id, options) {
    chrome.notifications.getPermissionLevel(function (level) {
        if (level === 'granted') {
            pending = {id: id, options: options};
            if (!timer)
                timer = setInterval(show, frequency);
        }
    });
};

M.hide = function () {
    clearTimeout(timer);
    if (pending)
        chrome.notifications.clear(pending.id);
    else if (last)
        chrome.notifications.clear(last.id);
    pending = last = null;
};


M.listen = function (handler) {
    chrome.notifications.onClosed.addListener(function (notificationId, byUser) {
        handler({
            type: 'closed',
            id: notificationId,
            byUser: byUser,
            options: last ? last.options : null
        })
    });

    chrome.notifications.onClicked.addListener(function (notificationId) {
        handler({
            type: 'clicked',
            id: notificationId,
            options: last ? last.options : null
        })
    });


    chrome.notifications.onButtonClicked.addListener(function (notificationId, buttonIndex) {
        handler({
            type: 'buttonClicked',
            id: notificationId,
            button: buttonIndex,
            options: last ? last.options : null
        })
    });
};

