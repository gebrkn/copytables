/// CSS tools

var M = module.exports = {};

var ignore = /^(width|height|display)$|^(-webkit|animation|motion)|-origin$/,
    props = null;

M.read = function (el) {
    var cs = window.getComputedStyle(el);

    if (!props) {
        props = [].filter.call(cs, function(p) {
            return !ignore.test(p);
        });
    }

    var res = {};

    props.forEach(function (p) {
        var val = cs.getPropertyValue(p);
        res[p] = val.replace(/\b(\d+\.\d+)(?=px\b)/g, function ($0, $1) {
            return Math.round(parseFloat($1));
        });
    });


    if (cs.getPropertyValue('display') === 'none') {
        res['display'] = 'none';
    }

    return res;
};

M.compute = function (defaults, custom) {
    var rules = [];

    Object.keys(custom).forEach(function (k) {
        if (custom[k] !== defaults[k]) {
            rules.push(k + ':' + custom[k]);
        }
    });

    return rules.join('; ');
};