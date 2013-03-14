/* global suite, test, assert, beforeEach, before, after */
define(['opjs/stack/peer-file-public', 'text!/data/public-peer-file.json'],
  function (Pfp, pblcJSON) {
  'use strict';

  suite('PeerFilePublic', function () {
    suite('#load', function () {
      var pfp, doc;
      var console$error;

      // Silence error reporting
      before(function () {
        console$error = console.error;
        console.error = function () {};
      });
      after(function () {
        console.error = console$error;
      });

      beforeEach(function () {
        doc = JSON.parse(pblcJSON).peer;
        pfp = new Pfp();
      });

      test('Rejects documents without a section A', function () {
        doc.sectionBundle.shift();
        assert.isFalse(pfp.load(doc));
      });

      test('Rejects documents without section A content', function () {
        delete doc.sectionBundle[0].section;
        assert.isFalse(pfp.load(doc));
      });

      test('Rejects documents without a salt bundle', function () {
        delete doc.sectionBundle[0].section.saltBundle;
        assert.isFalse(pfp.load(doc));
      });

      test('Rejects documents without a salt bundle signature', function () {
        delete doc.sectionBundle[0].section.saltBundle.signature;
        assert.isFalse(pfp.load(doc));
      });

      test('Rejects documents without a salt signature key', function () {
        delete doc.sectionBundle[0].section.saltBundle.signature.key;
        assert.isFalse(pfp.load(doc));
      });

      test('Rejects documents without a salt signature key domain', function () {
        delete doc.sectionBundle[0].section.saltBundle.signature.key.domain;
        assert.isFalse(pfp.load(doc));
      });

      test('Rejects documents with an invalid salt signature key domain', function () {
        doc.sectionBundle[0].section.saltBundle.signature.key.domain = '@#%#@$invalid domain///';
        assert.isFalse(pfp.load(doc));
      });
    });
  });
});
