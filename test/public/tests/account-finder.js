/* global suite, test, assert */
define(['opjs/stack/account-finder'], function (AccountFinder) {
  'use strict';

  suite('AccountFinder', function () {
    test('defines a function', function () {
      assert.typeOf(AccountFinder, 'function');
    });
  });
});
