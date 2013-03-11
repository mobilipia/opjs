define(['opjs/stack/peer'], function (Peer) {

  'use strict';

  function Contact(options) {

    this._peer = undefined;
    this._findSecret = undefined;

    if (options) {
      if ('peerURI' in options) {
        this.initFromPeerURI(options);
      } else if ('peerFilePublic' in options) {
        this.initFromPublicPeerFile(options);
      }
    }
  }

  Contact.prototype.initFromPeerURI = function (options) {
    this._peer = new Peer({ peerURI: options.peerURI });
    this._findSecret = options.findSecret;
  };

  Contact.prototype.initFromPublicPeerFile = function (options) {
    this._peer = new Peer({ peerFilePublic: options.peerFiePublic });
    this._findSecret = options.findSecret;
  };

  Contact.prototype.getID = function () {
    return this._peer.getID();
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
