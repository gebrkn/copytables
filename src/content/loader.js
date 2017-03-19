var M = module.exports = {};

M.load = function () {

    return new Promise(function(resolve) {

        function ready() {
            return document && (document.readyState === 'interactive' || document.readyState === 'complete');
        }

        function onload(e) {
            if (ready()) {
                console.log('loaded', document.readyState, document.URL);
                document.removeEventListener('readystatechange', onload);
                resolve();
            }
        }

        if (ready()) {
            console.log('ready', document.readyState, document.URL);
            return resolve();
        }

        console.log('not loaded', document.readyState, document.URL);
        document.addEventListener('readystatechange', onload);
    });

};
