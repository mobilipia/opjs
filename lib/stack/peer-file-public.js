define(['opjs/stack/peer', 'opjs/stack/util', 'opjs/cifre/cifre', 'opjs/vendor/sha1'],
  function (Peer, util, cifre, sha1) {
  'use strict';

  var SUPPORTED_CIPHERS = {
    'sha256/aes256': cifre.sha256
  };
  var SUPPORTED_SIGNING_ALGOS = {
    'http://openpeer.org/2012/12/14/jsonsig#rsa-sha1': cifre.rsa.RSAKey
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
    var cipher, content, domain, sectionSignature, saltSignature, contactID,
      publicKey, sectionSignAlgo, signFn, digest;

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
    sectionSignAlgo = sectionSignature.algorithm;
    if (!sectionSignAlgo) {
      console.error('PeerFilePublic: Signature algorithm not found.');
      return false;
    }
    signFn = SUPPORTED_SIGNING_ALGOS[sectionSignAlgo];
    if (!signFn) {
      console.error('PeerFilePublic: Unrecognized signing algorithm. ' +
        'Expecting one of [' +
        Object.keys(SUPPORTED_SIGNING_ALGOS).join(', ') + '], but found "' +
        sectionSignAlgo + '"');
      return false;
    }
    digest = sectionSignature.digestValue;
    publicKey = sectionSignature.key && sectionSignature.key.x509Data;
    if (!publicKey) {
      console.error('PeerFilePublic: Public key not found.');
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

    digest = Array.prototype.map.call(atob(digest), function (character) {
      return character.charCodeAt(0);
    });
    digest = cifre.utils.tohex(digest);

    if (digest !== this._generateSectionHash(sectionA)) {
      console.error('PeerFilePublic: Digest value does not match in Section A.');
      return false;
    }

    // TODO: Implement the check against the signed digest value

    return true;
  };

  PeerFilePublic.prototype.getFindSecret = function () {
    return this._findSecret;
  };

  PeerFilePublic.prototype.getPeerURI = function () {
    return this._peerURI;
  };

  // _generateContactID
  // Compute a Peer contact ID from the provided section A data
  // TODO: Correct this implementation
  PeerFilePublic.prototype._generateContactID = function (sectionA) {
    var plainText, contactID, cipher;

    cipher = SUPPORTED_CIPHERS[sectionA.section.cipher];
    plainText = 'contact:' + util.safeStringify({ section: sectionA.section });

    contactID = cifre.utils.tohex(cipher(cifre.utils.stringToArray(plainText)));

    return contactID;
  };

  PeerFilePublic.prototype._generateSectionHash = function (sectionBundle) {
    var hashFn, stringified;
    stringified = util.safeStringify({ section: sectionBundle.section });
    // TODO: Use sha1 implementation from cifre library
    hashFn = sha1;
    return hashFn(stringified);
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
