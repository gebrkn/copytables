/// Wrapper for chrome.notfications

var M = module.exports = {};

var frequency = 500,
    pending = null,
    timer = 0,
    last = null;


function stopTimer() {
    if (timer) {
        clearInterval(timer);
    }
    timer = 0;
}

function doShow() {
    if (pending) {
        chrome.notifications.create(pending.id, pending.options);
        console.log('notification: show');
        last = pending;
        pending = null;
    } else if (timer) {
        stopTimer();
        console.log('notification: no more');
    }
}

M.show = function (id, options) {
    chrome.notifications.getPermissionLevel(function (level) {
        if (level === 'granted') {
            pending = {id: id, options: options};
            if (!timer)
                timer = setInterval(doShow, frequency);
        }
    });
};

M.hide = function () {
    stopTimer();
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

