var number = require('../src/lib/number');

var formats = {
    en: {group: ',', decimal: '.'},
    de: {group: '.', decimal: ','},
    cz: {group: ' ', decimal: ','},
}


describe('parse returns null', function () {
    it('with no input', () =>
        expect(number.parse('', formats.en)).toBe(null));

    it('with no digits', () =>
        expect(number.parse('abc', formats.en)).toBe(null));

    it('with invalid chars', () =>
        expect(number.parse('12@34', formats.en)).toBe(null));

    it('with just decimal point', () =>
        expect(number.parse('.', formats.en)).toBe(null));

    it('with two decimal points', () =>
        expect(number.parse('123.123.456', formats.en)).toBe(null));

    it('with a non-integer fraction', () =>
        expect(number.parse('123.123,456', formats.en)).toBe(null));

    it('with a group more than 3', () =>
        expect(number.parse('123,1234', formats.en)).toBe(null));

    it('with a group less than 2', () =>
        expect(number.parse('123,1,234', formats.en)).toBe(null));

    it('with an empty group', () =>
        expect(number.parse('123,,234', formats.en)).toBe(null));

    it('with overflow', () =>
        expect(number.parse('234234234234234234234234234234234', formats.en)).toBe(null));

    it('with decimal overflow', () =>
        expect(number.parse('123.234234234234234234234234234234234', formats.en)).toBe(null));
});

describe('extract returns null', function () {
    it('with no input', () =>
        expect(number.extract('', formats.en)).toBe(null));

    it('with no digits', () =>
        expect(number.extract('abc', formats.en)).toBe(null));

    it('with more than one number', () =>
        expect(number.extract('abc 123 def 123.456', formats.en)).toBe(null));

    it('with invalid number', () =>
        expect(number.extract('abc 123.456.67', formats.en)).toBe(null));

});


describe('parse is ok', function () {
    it('with an integer', () =>
        expect(number.parse('12345', formats.en)).toBe(12345));
    it('with an negative integer', () =>
        expect(number.parse('-12345', formats.en)).toBe(-12345));
    it('with a decimal point', () =>
        expect(number.parse('12345.678', formats.en)).toBe(12345.678));
    it('with a void fraction', () =>
        expect(number.parse('12345.', formats.en)).toBe(12345));
    it('with a void fraction', () =>
        expect(number.parse('12345.', formats.en)).toBe(12345));
    it('with a void int part', () =>
        expect(number.parse('.123', formats.en)).toBe(0.123));
    it('with groups', () =>
        expect(number.parse('1,23,456.789', formats.en)).toBe(123456.789));
    it('with de groups', () =>
        expect(number.parse('1.23.456,789', formats.de)).toBe(123456.789));
    it('with cz groups', () =>
        expect(number.parse('1 23 456,789', formats.cz)).toBe(123456.789));

    it('with long decimal points', () =>
        expect(number.parse('552.123', formats.en)).toBe(552.123));
    it('with leading zero decimal points', () =>
        expect(number.parse('552.005', formats.en)).toBe(552.005));
    it('with zero decimal points', () =>
        expect(number.parse('552.000', formats.en)).toBe(552));
});


describe('extract is ok', function () {
    it('with an integer', () =>
        expect(number.extract('abc 12345 def', formats.en)).toBe(12345));
    it('with a negative integer', () =>
        expect(number.extract('abc -12345 def', formats.en)).toBe(-12345));
    it('with en groups and decimals', () =>
        expect(number.extract('abc -1,345,678.9 def', formats.en)).toBe(-1345678.9));
    it('with de groups and decimals', () =>
        expect(number.extract('abc -1.345.678,9 def', formats.de)).toBe(-1345678.9));
    it('with cz groups and decimals', () =>
        expect(number.extract('abc -1 345 678,9 def', formats.cz)).toBe(-1345678.9));
});


