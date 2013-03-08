define(['opjs/stack/peer'], function (Peer) {

  'use strict';

  function Contact(options) {

    this._peer = undefined;
    this._userID = undefined;
    this._findSecret = undefined;

    if (options.peerURI) {
      this.initFromPeerURI(options.peerURI);
    } else if (options.peerFilePublic) {
      this.initFromPublicPeerFile(options.peerFilePublic);
    }
  }

  Contact.prototype.initFromPeerURI = function (peerURI) {
    // TODO: Implement
    this._peer = new Peer({ peerURI: peerURI });
  };

  Contact.prototype.initFromPublicPeerFile = function (pfp) {
    // TODO: Implement
    this._peer = new Peer({ peerFilePublic: pfp });
  };

  Contact.prototype.getPeerURI = function () {
    return this._peer.getPeerURI();
  };

  Contact.prototype.getAccount = function () {
    return this._account;
  };

  Contact.prototype.getFindSecret = function () {
    var pfp = this._peer.getPeerFilePublic();
    if (pfp) {
      return pfp.getFindSecret();
    }
    return this._findSecret;
  };

  return Contact;
});
