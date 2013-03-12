define(function () {
  'use strict';

  var uriRegex = /^peer:\/\/([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}\/([a-f0-9][a-f0-9])+$/;

  function Peer(account, peerFilePublic, peerURI) {
    this._account = account;
    this._peerFilePublic = peerFilePublic;
    this._peerURI = peerURI;
    // If an analogous Peer object already exists in the provided account,
    // return a reference to that object.
    return account.addPeer(this);
  }

  var isValid = Peer.isValid = uriRegex.test.bind(uriRegex);

  // splitURI
  // Separate a Peer URI string into its domain and Contact ID components
  // Arguments:
  // - <string> peerURI: A string representing the Peer URI
  // Returns:
  //   If the Peer URI is valid, an object literal containing the Peer URI
  //   components: `domain` and `contactID` (`false` otherwise)
  Peer.splitURI = function (peerURI) {

    var slashPos;

    if (!isValid(peerURI)) {
      return false;
    }

    slashPos = peerURI.indexOf('/', 7);
    return {
      domain: peerURI.slice(7, slashPos),
      contactID: peerURI.slice(slashPos + 1)
    };
  };

  // joinURI
  // Given the components of a Peer URI, generate the corresponding Peer URI
  // Arguments:
  // - <object> uriParts: The Peer URI components, specified with the
  //   non-optional properties `domain` and `contactID`
  // Returns:
  //   A valid Peer URI if the supplied components were valid, `false`
  //   otherwise
  Peer.joinURI = function (urlParts) {
    var uri;

    if (!arguments.length) {
      return false;
    }

    uri = 'peer://' + urlParts.domain + '/' + urlParts.contactID;

    if (!Peer.isValid(uri)) {
      return false;
    }

    return uri;
  };

  Peer.prototype.getPeerFilePublic = function () {
    return this._peerFilePublic;
  };

  Peer.prototype.setPeerFilePublic = function (pfp) {
    this._peerFilePublic = pfp;
    this._peerURI = undefined;
  };

  // getPeerURI
  // Retrieve the Peer's Peer URI.
  Peer.prototype.getPeerURI = function () {
    if (this._peerFilePublic) {
      return this._peerFilePublic.getPeerURI();
    }
    return this._peerURI;
  };

  return Peer;
});
