/// Wrappers for chrome...sendMessage

var M = module.exports = {};

var util = require('./util');

function convertMessage(msg) {
    if (typeof msg !== 'object') {
        return {name: msg};
    }
    return msg;
}

function convertSender(sender) {
    if (!sender) {
        return {};
    }
    if (typeof sender !== 'object') {
        return sender;
    }
    var k = Object.keys(sender);
    if (k.length === 1 && k[0] === 'id') {
        return 'background';
    }
    if (sender.tab) {
        var p = Object.assign({}, sender);
        p.tabId = sender.tab.id;
        return p;
    }
    return sender;
}

function toBackground(msg) {
    msg.to = 'background';
    return new Promise(function (resolve) {
        chrome.runtime.sendMessage(msg, function (res) {
            resolve({receiver: 'background', data: res});
        });
    });
}

function toFrame(msg, frame) {
    msg.to = frame;
    return new Promise(function (resolve) {
        chrome.tabs.sendMessage(frame.tabId, msg, {frameId: frame.frameId}, function (res) {
            resolve({receiver: frame, data: res});
        });
    });
}

function toFrameList(msg, frames) {
    return Promise.all(frames.map(function (frame) {
        return toFrame(msg, frame);
    }));
}

M.enumFrames = function (tabFilter) {

    function framesInTab(tab) {
        return new Promise(function (resolve) {
            chrome.webNavigation.getAllFrames({tabId: tab.id}, function (frames) {
                resolve(frames.map(function (f) {
                    f.tabId = tab.id;
                    return f;
                }));
            });
        });
    }

    if (tabFilter === 'active') {
        tabFilter = {active: true, currentWindow: true};
    }

    return new Promise(function (resolve) {
        chrome.tabs.query(tabFilter || {}, function (tabs) {
            Promise.all(tabs.map(framesInTab)).then(function (res) {
                resolve(util.flatten(res));
            });
        });
    });
};

M.background = function (msg) {
    console.log('MESSAGE: background', msg);
    return toBackground(convertMessage(msg));
};

M.frame = function (msg, frame) {
    console.log('MESSAGE: frame', msg, frame);
    return toFrame(convertMessage(msg), frame);
};

M.allFrames = function (msg) {
    console.log('MESSAGE: allFrames', msg);
    msg = convertMessage(msg);
    return M.enumFrames('active').then(function (frames) {
        return toFrameList(msg, frames);
    });
};

M.topFrame = function (msg) {
    console.log('MESSAGE: topFrame', msg);
    msg = convertMessage(msg);
    return M.enumFrames('active').then(function (frames) {
        var top = frames.filter(function (f) {
            return f.frameId === 0;
        });
        if (top.length) {
            return toFrame(msg, top[0]);
        }
    });
};

M.broadcast = function (msg) {
    console.log('MESSAGE: broadcast', msg);
    msg = convertMessage(msg);
    return M.enumFrames().then(function (frames) {
        return toFrameList(msg, frames);
    });
};

M.listen = function (listeners) {
    chrome.runtime.onMessage.addListener(function (msg, sender, fn) {
        if (listeners[msg.name]) {
            msg.sender = convertSender(sender);
            var res = listeners[msg.name](msg);
            //console.log('RESPONDING TO', msg, res);
            return fn(res);
        }
        console.log('LOST', msg.name);
    });
};
