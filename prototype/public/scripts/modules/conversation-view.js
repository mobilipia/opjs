define([
  'text!templates/conversation.html', 'modules/stream-views', 'layoutmanager',
  '_'
  ], function(html, StreamViews, Backbone, _) {
  'use strict';

  var ConversationView = Backbone.Layout.extend({
    className: 'conversation',
    template: _.template(html),
    events: {
      'click .btn-hang-up': 'hangUp'
    },
    initialize: function() {
      this.localStreamView = new StreamViews.LocalStreamView();
      this.remoteStreamView = new StreamViews.StreamView();
      this.setView('.source', this.localStreamView);
      this.setView('.remote', this.remoteStreamView);
    },
    startCall: function(peer) {
      // Ensure that any previous call is ended
      this.endCall();

      // TODO: Re-factor to support multiple remote peers
      this.peer = peer;
      this.listenTo(this.peer, 'addstream', function(stream) {
        console.log('Remote stream added');
        this.playRemoteStream(stream);
      });
      this.listenTo(this.peer, 'removestream', function() {
        console.log('Remove remote stream');
        this.stopRemoteStream();
      });
      this.listenTo(this.peer, 'destroy', this.endCall);

      return this.localStreamView.requestMedia().then(function(stream) {
        peer.addStream(stream);
        this.setStatus({ calling: true });
        return stream;
      }.bind(this));
    },
    endCall: function(reason) {
      if (this.peer) {
        this.stopListening(this.peer);
      }
      this.setStatus(reason);
      this.stopRemoteStream();
      this.stopLocalStream();
      this.render();
    },
    hangUp: function() {
      this.endCall();
      this.trigger('hangup', this.peer);
    },
    playLocalStream: function(stream) {
      //this.localStreamView.play(stream);
      this.peer.addStream(stream);
    },
    playRemoteStream: function(stream) {
      this.remoteStreamView.play(stream);
      this.setStatus({ active: true });
    },
    stopLocalStream: function() {
      this.localStreamView.stop();
      // TODO: implement Peer#removeStream
    },
    stopRemoteStream: function() {
      this.remoteStreamView.stop();
      this.render();
    },
    setStatus: function(status) {
      this.status = status;
      this.render();
    },
    serialize: function() {
      return {
        status: this.status,
        peer: this.peer && this.peer.toJSON(),
        isPlaying: this.remoteStreamView.isPlaying()
      };
    }
  });

  return ConversationView;
});
