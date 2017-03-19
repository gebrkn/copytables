/// CSS tools

var M = module.exports = {};


// Default table cell styles.
var defaultStyle = {
    'background-image': 'none',
    'background-position': '0% 0%',
    'background-size': 'auto',
    'background-repeat': 'repeat',
    'background-origin': 'padding-box',
    'background-clip': 'border-box',
    'background-color': 'rgba(0, 0, 0, 0)',
    'border-collapse': 'separate',
    'border-top': '0px none rgb(0, 0, 0)',
    'border-right': '0px none rgb(0, 0, 0)',
    'border-bottom': '0px none rgb(0, 0, 0)',
    'border-left': '0px none rgb(0, 0, 0)',
    'caption-side': 'top',
    'clip': 'auto',
    'color': 'rgb(0, 0, 0)',
    'content': '',
    'counter-increment': 'none',
    'counter-reset': 'none',
    'direction': 'ltr',
    'empty-cells': 'show',
    'float': 'none',
    'font-family': 'Times',
    'font-size': '16px',
    'font-style': 'normal',
    'font-variant': 'normal',
    'font-weight': 'normal',
    'letter-spacing': 'normal',
    'line-height': 'normal',
    'list-style': 'disc outside none',
    'margin': '0px',
    'outline': 'rgb(0, 0, 0) none 0px',
    'overflow': 'visible',
    'padding': '0px',
    'table-layout': 'auto',
    'text-align': 'start',
    'text-decoration': 'none solid rgb(0, 0, 0)',
    'text-indent': '0px',
    'text-transform': 'none',
    'vertical-align': 'middle',
    'visibility': 'visible',
    'white-space': 'normal',
    'word-spacing': '0px',
    'z-index': 'auto'
}

var defaultStyleProps = Object.keys(defaultStyle);

M.style = function (el) {
    var computed = document.defaultView.getComputedStyle(el),
        style = [];

    defaultStyleProps.forEach(function (p) {
        var val = computed[p];

        val = val.replace(/\b([\d.]+)px\b/g, function (_, $1) {
            return Math.round(parseFloat($1)) + 'px';
        });

        if (val.length && val != defaultStyle[p])
            style.push(p + ':' + val);
    });

    if (computed['display'] == 'none')
        style.push('display:none');

    return style.join(';');
};

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

    return res;
}

M.compute = function (defaults, custom) {
    var rules = [];

    Object.keys(custom).forEach(function (k) {
        if (custom[k] !== defaults[k]) {
            rules.push(k + ':' + custom[k]);
        }
    });

    return rules.join('; ');
};
