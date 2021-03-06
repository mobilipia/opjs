define([
  'text!templates/login.html', 'modules/peer', 'modules/oauth-prefilter',
  'layoutmanager', '_', 'q',
  'jquery'
  ], function(html, Peer, OauthPrefilter, Backbone, _, Q, $) {
  'use strict';

  var AuthEndpoints = {
    GitHub: 'https://github.com/login/oauth/authorize' +
      '?client_id=<%= client_id %>&state=<%= session_id %>'
  };

  var LoginView = Backbone.Layout.extend({
    className: 'modal login',
    events: {
      'click .btn[data-provider]': 'requestAuth'
    },
    template: _.template(html),
    initialize: function(options) {
      var dfd = this._dfd = Q.defer();
      var prms = dfd.promise;
      this.cookies = options.cookies;
      this.then = prms.then.bind(prms);
      this.status = { prompt: true };
      if (this.cookies.access_token) {
        // TODO: Infer provider from application state
        var provider = 'GitHub';
        dfd.resolve({
          PeerCtor: Peer.models[provider],
          PeersCtor: Peer.models[provider].Peers,
          prefilter: OauthPrefilter.create(provider, this.cookies.access_token)
        });
      }
    },
    setStatus: function(status) {
      this.status = status;
      this.render();
    },
    redirect: function(location) {
      window.location = location;
    },
    requestAuth: function(event) {
      event.preventDefault();
      var provider = $(event.target).data('provider');
      var endpointTmpl = _.template(AuthEndpoints[provider]);
      console.log(Object.keys(this.cookies));
      var endpoint = endpointTmpl(this.cookies);
      this.redirect(endpoint);
    },
    serialize: function() {
      return {
        status: this.status
      };
    }
  });

  return {
    AuthEndpoints: AuthEndpoints,
    View: LoginView
  };
});
