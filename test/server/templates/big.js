
module.exports.render = h => {

    function bgcolor(n) {
        n = ((n * 123456789) % 0xffffff).toString(16);
        while(n.length < 6) n = '0' + n;
        return `style="background-color:#${n}"`;
    }

    function chunk(n) {
        n = n % text.length;
        return text.substr(n, n + 100)
    }

    function num(n, m) {
        return (n & 0xffff) * m;
    }

    let rc = 1000,
        rows = [],
        text = h.textSource();

    rc.times(function (i) {
        let cells = [];

        let k  = Math.pow(7, (i % 300)) % 123456;

        cells.push(`<td ${bgcolor(k+1)}>${i}</td>`);
        cells.push(`<td ${bgcolor(k+2)}>${k}</td>`);
        cells.push(`<td ${bgcolor(k+3)}>${num(k, 123456)},${num(k, 123456)},${num(k, 123456)},${num(k, 123456)},${num(k, 123456)}</td>`);
        cells.push(`<td ${bgcolor(k+4)}>${chunk(k)}</td>`);
        cells.push(`<td ${bgcolor(k+5)}>${chunk(k + 10)}</td>`);
        cells.push(`<td ${bgcolor(k+6)}>${num(k, 9876)}</td>`);

        rows.push(`<tr>${cells.join('')}</tr>`);
    });


    return `
        <style>
            .big table {
                border-collapse: separate;
                border-spacing: 10px;
            }
            .big td {
                border: 1px solid salmon;
                padding: 5px;
        }
        </style>
        <div class="big">
            <table>${rows.join('')}</table>
        </div>
    `
};