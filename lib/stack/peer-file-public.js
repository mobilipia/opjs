define(['opjs/stack/peer', 'opjs/stack/util', 'opjs/cifre/cifre'],
  function (Peer, util, cifre) {
  'use strict';

  var SUPPORTED_CIPHERS = {
    'sha256/aes256': cifre.sha256
  };

  function PeerFilePublic(options) {
    options = options || {};
    this._publicKey = options.publicKey;
    this._peerURI = options.peerURI;
    this._outer = options.peerFiles;
    this._document = undefined;

    if (options.document) {
      this.load(options.document);
    }
  }

  PeerFilePublic.prototype.load = function (document) {
    var orig = this._document;
    this._document = document;
    if (!this.verify()) {
      this._document = orig;
      return false;
    }
    return true;
  };

  // verify
  // Determine whether the document is a technically valid Public Peer File
  PeerFilePublic.prototype.verify = function () {

    var sectionA = this.getSection('A');
    var cipher, content, domain, sectionSignature, saltSignature, contactID;

    // Check document shape
    if (!sectionA) {
      console.error('PeerFilePublic: Unable to find Section A');
      return false;
    }
    sectionSignature = sectionA.signature;
    if (!sectionSignature) {
      console.error('PeerFilePublic: Unable to find signature for Section A');
      return false;
    }
    content = sectionA.section;
    if (!content) {
      console.error('PeerFilePublic: Content of Section A not found');
      return false;
    }
    cipher = content.cipher;
    if (!SUPPORTED_CIPHERS[cipher]) {
      console.error('PeerFilePublic: Unrecognized cipher. ' +
        'Expecting one of [' + Object.keys(SUPPORTED_CIPHERS).join(', ') +
        '], but found "' + cipher + '"');
      return false;
    }
    saltSignature = content.saltBundle && content.saltBundle.signature;
    if (!saltSignature) {
      console.error('PeerFilePublic: Salt signature not found.');
      return false;
    }
    domain = saltSignature.key && saltSignature.key.domain;
    if (domain === null || domain === undefined) {
      console.error('PeerFilePubic: Salt signature domain not found.');
      return false;
    }
    // Ensure that domain is not an empty string
    if (!domain) {
      console.error('PeerFilePublic: Empty salt signature domain.');
      return false;
    }

    // Check document content
    contactID = this._generateContactID(sectionA);
    this._peerURI = Peer.joinURI({
      domain: domain,
      contactID: contactID
    });
    if (!this._peerURI) {
      console.error('PeerFilePublic: Failed to generate a valid Peer URI');
      return false;
    }

    // TODO: Implement the remaining verification logic.

    return true;
  };

  // _generateContactID
  // Compute a Peer contact ID from the provided section A data
  PeerFilePublic.prototype._generateContactID = function (sectionA) {
    var sectionAStr, contactID, cipher;

    cipher = SUPPORTED_CIPHERS[sectionA.section.cipher];
    sectionAStr = 'contact:' + util.safeStringify(sectionA);
    contactID = cifre.utils.tohex(cipher(sectionAStr));
    return contactID;
  };

  PeerFilePublic.prototype.getSection = function (sectionID) {
    var sections = this._document && this._document.sectionBundle;
    var requested;

    util.forEach(sections, function (section) {
      if (section && section.section && section.section.$id === sectionID) {
        requested = section;
      }
    });

    return requested;
  };

  return PeerFilePublic;
});
