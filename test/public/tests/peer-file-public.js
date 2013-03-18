/* global suite, test, assert, setup, suiteSetup, suiteTeardown */
define(['opjs/stack/peer-file-public', 'text!/data/public-peer-file.json', 'text!/data/private-peer-file.json'],
  function (Pfp, pblcJSON, prvtJSON) {
  'use strict';

  suite('PeerFilePublic', function () {

    var pfp, pblcDoc, prvtDoc;

    setup(function () {
      pblcDoc = JSON.parse(pblcJSON).peer;
      prvtDoc = JSON.parse(prvtJSON).privatePeer;
      pfp = new Pfp();
    });

    suite('#getPeerURI', function () {
      test('Returns the correct Peer URI', function () {
        pfp.load(pblcDoc);
        assert.equal(pfp.getPeerURI(), prvtDoc.sectionBundle[0].section.contact);
      });
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

      test('Rejects pblcDocuments without a section A', function () {
        pblcDoc.sectionBundle.shift();
        assert.isFalse(pfp.load(pblcDoc));
      });

      test('Rejects pblcDocuments without section A content', function () {
        delete pblcDoc.sectionBundle[0].section;
        assert.isFalse(pfp.load(pblcDoc));
      });

      test('Rejects pblcDocuments without a salt bundle', function () {
        delete pblcDoc.sectionBundle[0].section.saltBundle;
        assert.isFalse(pfp.load(pblcDoc));
      });

      test('Rejects pblcDocuments without a salt bundle signature', function () {
        delete pblcDoc.sectionBundle[0].section.saltBundle.signature;
        assert.isFalse(pfp.load(pblcDoc));
      });

      test('Rejects pblcDocuments without a salt signature key', function () {
        delete pblcDoc.sectionBundle[0].section.saltBundle.signature.key;
        assert.isFalse(pfp.load(pblcDoc));
      });

      test('Rejects pblcDocuments without a salt signature key domain', function () {
        delete pblcDoc.sectionBundle[0].section.saltBundle.signature.key.domain;
        assert.isFalse(pfp.load(pblcDoc));
      });

      test('Rejects pblcDocuments with an invalid salt signature key domain', function () {
        pblcDoc.sectionBundle[0].section.saltBundle.signature.key.domain = '@#%#@$invalid domain///';
        assert.isFalse(pfp.load(pblcDoc));
      });

      test('Rejects pblcDocuments without a signature algorithm', function () {
        delete pblcDoc.sectionBundle[0].signature.algorithm;
        assert.isFalse(pfp.load(pblcDoc));
      });

      test('Rejects pblcDocuments that specify an invalid signing alorithm', function () {
        pblcDoc.sectionBundle[0].signature.algorithm = 'This is a bogus algorithm';
        assert.isFalse(pfp.load(pblcDoc));
      });

      test('Rejects pblcDocuments without a signature key object', function () {
        delete pblcDoc.sectionBundle[0].signature.key;
        assert.isFalse(pfp.load(pblcDoc));
      });

      test('Rejects pblcDocuments without a signature certificate', function () {
        delete pblcDoc.sectionBundle[0].signature.key.x509Data;
        assert.isFalse(pfp.load(pblcDoc));
      });

      test('Rejects pblcDocuments with a faulty digest', function () {
        pblcDoc.sectionBundle[0].signature.digestValue = 'a' +
          pblcDoc.sectionBundle[0].signature.digestValue.slice(1);
        assert.isFalse(pfp.load(pblcDoc));
      });
    });

    suite('#getFindSecret', function () {

      var console$warn;

      suiteSetup(function () {
        console$warn = console.warn;
        console.warn = function () {};
      });
      suiteTeardown(function () {
        console.warn = console$warn;
      });

      test('Returns the find secret when available', function () {
        pfp.load(pblcDoc);
        assert.equal(
          pfp.getFindSecret(),
          pblcDoc.sectionBundle[1].section.findSecret
        );
      });

      test('Returns the empty string when peer file has no section B', function () {
        pblcDoc.sectionBundle.splice(1, 1);
        pfp.load(pblcDoc);
        assert.equal(pfp.getFindSecret(), '');
      });

      test('Returns the empty string when peer file has no find secret', function () {
        delete pblcDoc.sectionBundle[1].section.findSecret;
        pfp.load(pblcDoc);
        assert.equal(pfp.getFindSecret(), '');
      });
    });

    suite('#getSection', function () {
      setup(function () {
        pfp.load(pblcDoc);
      });

      test('Returns the requested section', function () {
        assert.equal(pfp.getSection('A'), pblcDoc.sectionBundle[0]);
        assert.equal(pfp.getSection('B'), pblcDoc.sectionBundle[1]);
        assert.equal(pfp.getSection('C'), pblcDoc.sectionBundle[2]);
      });

      test('Returns `undefined` when section is not found', function () {
        assert.isUndefined(pfp.getSection('D'));
      });
    });
  });
});
