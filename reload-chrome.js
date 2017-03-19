/// Reload the extensions page and the the given url.
/// run me as `osascript -l JavaScript reload-chrome.js 'http://whatever`

function run(argv) {
    var app = Application('Google Chrome'),
        extUrl = 'chrome://extensions/',
        ctxUrl = argv;

    function each(a, fn) {
        for (var i = 0; i < a.length; i++)
            fn(a[i], i);
    }

    function find(a, fn) {
        for (var i = 0; i < a.length; i++)
            if (fn(a[i], i))
                return a[i];
        return null;
    }

    function enumTabs() {
        var wts = [];

        each(app.windows, function (win) {
            each(win.tabs, function (tab, i) {
                wts.push([win, tab, i])
            });
        });

        return wts.filter(function (wt) {
            return !wt[0].title().match(/^Developer Tools/);
        });
    }

    function reload() {
        var wts = enumTabs();

        var ctxWt = find(wts, function (wt) {
            return wt[1].url() == ctxUrl;
        });

        var extWt = find(wts, function (wt) {
            return wt[1].url() == extUrl;
        });

        if (!ctxWt) {
            console.log('no tab found for ' + ctxUrl);
            var w = app.Window().make();
            ctxWt = [w, w.tabs[0], 0];
            w.tabs[0].url = ctxUrl;
        }

        if (!extWt) {
            console.log('no tab found for ' + extUrl);
            var w = app.Window().make();
            extWt = [w, w.tabs[0], 0];
            w.tabs[0].url = extUrl;
        }

        while(extWt[1].loading());
        while(ctxWt[1].loading());

        extWt[1].reload();
        while(extWt[1].loading());

        ctxWt[1].reload();
        ctxWt[0].activeTabIndex = ctxWt[2] + 1;
    }

    app.activate();
    reload();
}
