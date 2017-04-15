/// Matrix manipulations

var M = module.exports = {};

M.column = function (mat, ci) {
    return mat.map(function (row) {
        return row[ci];
    });
};

M.transpose = function (mat) {
    if (!mat.length)
        return mat;
    return mat[0].map(function (_, ci) {
        return M.column(mat, ci);
    });
};

M.trim = function (mat, fn) {

    var fun = function (row) {
        return row.some(function (cell) {
            return fn(cell);
        });
    };

    mat = mat.filter(fun);
    mat = M.transpose(mat).filter(fun);
    return M.transpose(mat);
};

M.each = function (mat, fn) {
    mat.forEach(function (row, ri) {
        row.forEach(function (cell, ci) {
            fn(row, cell, ri, ci);
        });
    });
};

M.map = function (mat, fn) {
    return mat.map(function (row, ri) {
        return row.map(function (cell, ci) {
            return fn(row, cell, ri, ci);
        });
    });
};
