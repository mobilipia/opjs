/* global suite, test, assert */
define(['opjs/stack/util'], function (util) {

  'use strict';

  suite('util', function () {

    test('Is an object', function () {
      assert.equal(typeof util, 'object');
    });

    suite('randomHex', function () {

      test('Generates random hex strings', function () {
        var hex = util.randomHex(16);
        assert.equal(hex.length, 32);
        assert(/^[0-9a-f]*$/.test(hex));
      });

    });

    suite('forEach', function () {

      test('Iterates over arrays with the supplied context', function () {
        var myArr = [0, 2, 4];
        var ctx = {};
        var count = 0;

        util.forEach(myArr, function (elem, idx, collection) {
          assert.equal(elem / 2, idx);
          assert.equal(myArr, collection);
          assert.equal(this, ctx);
          count++;
        }, ctx);

        assert.equal(count, 3);
      });

      test('Iterates over objects with the supplied context', function () {
        var myObj = {
          one: 'one!',
          two: 'two!',
          three: 'three!'
        };
        var ctx = {};
        var count = 0;

        util.forEach(myObj, function (elem, key, collection) {
          assert.equal(elem, key + '!');
          assert.equal(myObj, collection);
          assert.equal(this, ctx);
          count++;
        }, ctx);

        assert.equal(count, 3);
      });

      test('Ignores non-iterable values', function () {
        var callCount = 0;
        var error;
        var inc = function () {
          callCount++;
        };
        try {
          util.forEach(undefined, inc);
        } catch (e) {
          error = e;
        }
        assert.isUndefined(error);
        assert.equal(callCount, 0);
        try {
          util.forEach(null, inc);
        } catch (err) {
          error = err;
        }
        assert.isUndefined(error);
        assert.equal(callCount, 0);
      });

    });

    suite('safeStringify', function () {

      test('Returns an equivalent string representation', function () {
        var complex1, complex2;
        assert.deepEqual(JSON.parse(util.safeStringify({ b: 4 })), { b: 4 });
        assert.deepEqual(JSON.parse(util.safeStringify([4, 5])), [4, 5]);
        assert.equal(JSON.parse(util.safeStringify(null)), null);
        assert.equal(JSON.parse(util.safeStringify(23)), 23);

        complex1 = {
          a: 1,
          b: ['2', null],
          c: {}
        };
        complex2 = {
          a: 1,
          b: ['2', null],
          c: {}
        };
        assert.deepEqual(JSON.parse(util.safeStringify(complex1)), complex2);
      });

      // TODO: Implement this functionality and enable this test
      test('Renders object keys in consistent order'/*, function () {
        var obj = { b: 1, c: 2, a: 3 };
        var str = '{"a":3,"b":1,"c":2}';

        assert.equal(util.safeStringify(obj), str);
      }*/);
    });

  });
});
