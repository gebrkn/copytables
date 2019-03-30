/// Reload extensions....
/// run me as `osascript -l JavaScript reload-chrome.js`
//  requires Extension Reloader https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid

function run(argv) {
    var app = Application('Google Chrome'),
        extUrl = 'http://reload.extensions',
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
                wts.push({'window': win, 'tab': tab})
            });
        });

        return wts.filter(function (wt) {
            return !wt.window.title().match(/^Developer Tools/);
        });
    }

    function reload() {
        var wts = enumTabs();

        if (!wts.length) {
            console.log('no open tabs');
            var w = app.Window().make();
            w.tabs[0].url = extUrl;
        } else {
            wts[0].tab.url = extUrl;
        }
    }

    app.activate();
    reload();
}
