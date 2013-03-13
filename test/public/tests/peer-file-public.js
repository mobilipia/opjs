/* global suite, test, assert, beforeEach, before, after */
define(['opjs/stack/peer-file-public'], function (Pfp) {
  'use strict';

  suite('PeerFilePublic', function () {
    suite('#load', function () {
      var pfp;
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
        pfp = new Pfp();
      });

      test('Rejects malformed documents', function () {
        var doc, sectionBundle, sectionA, saltBundle, saltSig;

        assert.isFalse(pfp.load(doc));

        doc = {};
        assert.isFalse(pfp.load(doc));

        sectionBundle = doc.sectionBundle = [];
        assert.isFalse(pfp.load(doc));

        sectionBundle.push({});
        assert.isFalse(pfp.load(doc));

        sectionA = {};
        sectionBundle.push(sectionA);
        assert.isFalse(pfp.load(doc));

        sectionA.section = {};
        assert.isFalse(pfp.load(doc));

        sectionA.section.$id = 'A';
        assert.isFalse(pfp.load(doc));

        sectionA.signature = {};
        assert.isFalse(pfp.load(doc));

        sectionA.section.cipher = 'sha256/aes256';
        assert.isFalse(pfp.load(doc));

        saltBundle = sectionA.section.saltBundle = {};
        assert.isFalse(pfp.load(doc));

        saltSig = saltBundle.signature = {};
        assert.isFalse(pfp.load(doc));

        saltSig.key = {};
        assert.isFalse(pfp.load(doc));

        saltSig.key.domain = '@#%#@$invalid domain///';
        assert.isFalse(pfp.load(doc));
      });
    });
  });
});
