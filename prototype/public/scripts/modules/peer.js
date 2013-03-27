define([
  'modules/rtc-compat', 'backbone'
  ], function(rtc, Backbone) {
  'use strict';

  var Peer = Backbone.Model.extend({
    nameRegex: /^[0-9a-z\.-]+$/i,
    validate: function(attrs) {
      if (!attrs || !attrs.name) {
        return new Error('No username specified');
      } else if (!this.nameRegex.test(attrs.name)) {
        return new Error('Invalid username');
      }
    }
  });

  Peer.prototype.connect = function(options) {
    var peerConn;
    if (this.peerConn) {
      this.destroy();
    }
    try {
      peerConn = this.peerConn = new rtc.RTCPeerConnection(options);
    } catch (e) {
      console.error('Failed to create PeerConnection, exception: ' + e.message);
      return null;
    }
    // send any ice candidates to the other peer
    peerConn.onicecandidate = this._handleIceCandidate.bind(this);
    rtc.on(peerConn, 'addstream', this._handleAddStream.bind(this));
    rtc.on(peerConn, 'removestream', this._handleRemoveStream.bind(this));
  };

  // addStream
  // Add a stream object to the local stream set of the Peer Connection
  // instance
  Peer.prototype.addStream = function(stream) {
    this.peerConn.addStream(stream);
  };

  // setLocalDescription
  // Create a valid WebRTC Session Description object from the provided data
  // and set it as the local description of the Peer Connection instance
  Peer.prototype.setLocalDescription = function(desc) {
    desc = new rtc.RTCSessionDescription(desc);
    this.peerConn.setLocalDescription(desc);
  };

  // setRemoteDescription
  // Create a valid WebRTC Session Description object from the provided data
  // and set it as the remote description of the Peer Connection instance
  Peer.prototype.setRemoteDescription = function(desc) {
    desc = new rtc.RTCSessionDescription(desc);
    this.peerConn.setRemoteDescription(desc);
  };

  // addIceCandidate
  // Create a valid WebRTC Ice Candidate object from the provided data and add
  // it to the Peer Connection instance
  Peer.prototype.addIceCandidate = function(candidateData) {
    var candidate = new rtc.RTCIceCandidate({
      sdpMLineIndex: candidateData.sdpMLineIndex,
      sdpMid: candidateData.sdpMid,
      candidate: candidateData.candidate
    });
    this.peerConn.addIceCandidate(candidate);
  };

  Peer.prototype._handleIceCandidate = function(evt) {
    var candidate = evt && evt.candidate;
    var msg;
    if (candidate) {
      msg = {
        type: 'candidate',
        sdpMLineIndex: evt.candidate.sdpMLineIndex,
        sdpMid: evt.candidate.sdpMid,
        candidate: evt.candidate.candidate
      };
      this.trigger('ice', msg);
    } else {
      console.log('End of candidates.');
    }
  };

  Peer.prototype._handleAddStream = function(event) {
    this.trigger('addstream', event.stream);
  };

  Peer.prototype._handleRemoveStream = function() {
    this.trigger('removestream');
  };

  Peer.prototype.isActive = function() {
    return !!this.peerConn;
  };

  Peer.prototype.createOffer = function(success, failure, mediaConstraints) {
    var cbs = this._wrapCallbacks({
      success: success,
      failure: failure
    });
    this.peerConn.createOffer(cbs.success, cbs.failure, mediaConstraints);
  };

  Peer.prototype.createAnswer = function(success, failure, mediaConstraints) {
    var cbs = this._wrapCallbacks({
      success: success,
      failure: failure
    });
    this.peerConn.createAnswer(cbs.success, cbs.failure, mediaConstraints);
  };

  // _wrapCallbacks
  // Private method to create callbacks that will be invoked in the context of
  // the Peer object. Avoiding `Function.prototype.bind` allows users to
  // optionally override the context of their callback functions.
  Peer.prototype._wrapCallbacks = function(callbacks) {
    var self = this;
    var success = callbacks.success;
    var failure = callbacks.failure;
    if (typeof success === 'function') {
      callbacks.success = function() {
        success.apply(self, arguments);
      };
    }
    if (typeof failure === 'function') {
      callbacks.failure = function() {
        failure.apply(self, arguments);
      };
    }
    return callbacks;
  };

  Peer.prototype.destroy = function() {
    this.trigger('destroy');
    this.peerConn.close();
    delete this.peerConn;
  };

  return Peer;
});