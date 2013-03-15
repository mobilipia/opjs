/* global suite, test, assert, setup, suiteSetup, suiteTeardown */
define(['opjs/stack/peer-file-public', 'text!/data/public-peer-file.json'],
  function (Pfp, pblcJSON) {
  'use strict';

  suite('PeerFilePublic', function () {

    var pfp, doc;

    setup(function () {
      doc = JSON.parse(pblcJSON).peer;
      pfp = new Pfp();
    });

    suite('#load', function () {
      var console$error;

      // Silence error reporting
      suiteSetup(function () {
        console$error = console.error;
        console.error = function () {};
      });
      suiteTeardown(function () {
        console.error = console$error;
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

      test('Rejects documents without a signature algorithm', function () {
        delete doc.sectionBundle[0].signature.algorithm;
        assert.isFalse(pfp.load(doc));
      });

      test('Rejects documents that specify an invalid signing alorithm', function () {
        doc.sectionBundle[0].signature.algorithm = 'This is a bogus algorithm';
        assert.isFalse(pfp.load(doc));
      });

      test('Rejects documents without a signature key object', function () {
        delete doc.sectionBundle[0].signature.key;
        assert.isFalse(pfp.load(doc));
      });

      test('Rejects documents without a signature certificate', function () {
        delete doc.sectionBundle[0].signature.key.x509Data;
        assert.isFalse(pfp.load(doc));
      });

      test('Rejects documents with a faulty digest', function () {
        doc.sectionBundle[0].signature.digestValue = 'a' +
          doc.sectionBundle[0].signature.digestValue.slice(1);
        assert.isFalse(pfp.load(doc));
      });
    });

    suite('#getSection', function () {
      setup(function () {
        pfp.load(doc);
      });

      test('Returns the requested section', function () {
        assert.equal(pfp.getSection('A'), doc.sectionBundle[0]);
        assert.equal(pfp.getSection('B'), doc.sectionBundle[1]);
        assert.equal(pfp.getSection('C'), doc.sectionBundle[2]);
      });

      test('Returns `undefined` when section is not found', function () {
        assert.isUndefined(pfp.getSection('D'));
      });
    });
  });
});
