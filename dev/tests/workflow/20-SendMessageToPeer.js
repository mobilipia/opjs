
define([
  'opjs/stack/util',
  'opjs/OpenPeer'
], function(Util, OpenPeer) {

  suite("StartChat", function() {

    var client1 = new OpenPeer({
      deviceID: Util.randomHex(32)
    });
    var client2 = new OpenPeer({
      deviceID: Util.randomHex(32)
    });

    test('connected', function(done) {

      return client1.ready().then(function() {
        return client2.ready().then(function() {

          return done(null);
        });
      });
    });

    var targetPeer = null;

    test('connect to peer', function(done) {

      return client1.connectToPeer(client2.getPeerURI()).then(function(peer) {

      	targetPeer = peer;

      	return done(null);
      }, done);

    });

    test('send message', function(done) {

	  return targetPeer.sendMessage("Hello World").then(function() {

		// TODO: Wait for `client2.on("message", function() {})`

      	return done(null);
  	  }, done);
    });

    test('destroy', function(done) {

      return client1.destroy().then(function() {
        return client2.destroy().then(function() {

          return done(null);
        }, done);
      }, done);
    });

  });

});