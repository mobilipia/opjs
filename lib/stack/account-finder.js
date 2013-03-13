define(function () {
  'use strict';

  var KEEPALIVE_TIMEOUT = 1000 * 60;

  function AccountFinder(account) {

    // Implement AccountFinder as a singleton
    if (AccountFinder._instance) {
      return AccountFinder._instance;
    }
    AccountFinder._create(this);

    this._outer = account;
    this._id = undefined;
    this._state = undefined;
    this._finder = undefined;
    this._finderIP = undefined;
    this._messaging = undefined;
    this._keepAliveTimer = undefined;
    this._SocketSubscription = undefined;
    this._SocketSession = undefined;
    this._Messaging = undefined;
    this._SessionCreateMonitor = undefined;
    this._SessionKeepAliveMonitor = undefined;
    this._SessionDeleteMonitor = undefined;
  }

  AccountFinder.States = {
    pending: 0,
    ready: 1,
    shuttingdown: 2,
    shutdown: 4
  };

  AccountFinder._create = function (instance) {
    AccountFinder._instance = instance;
  };

  AccountFinder.prototype.getState = function () {
    return this._state;
  };

  AccountFinder.prototype._setState = function (stateName) {
    this._state = AccountFinder.States[stateName];
  };

  AccountFinder.prototype._is = function (stateName) {
    return this._state === stateName;
  };

  AccountFinder.prototype.send = function (msg) {
    var doc;

    if (!msg) {
      console.error('No message specified.');
      return false;
    }

    if (this._is('shutdown')) {
      console.warn('Unable to send message (AccountFinder is shut down).');
      return false;
    }

    /*
    if (!this._is('ready')) {
      if (!this._is('shuttingdown')) {
        // TODO: Implement SessionCreateRequest and include as a dependency
        if (!SessionCreateRequest.convert(msg)) {
          console.warn('Unable to send message (AccountFinder is not ready).');
          return false;
        }
      } else {
        // TODO: Implement SessionDeleteRequest and include as a dependency
        if (!SessionDeleteRequest.convert(msg)) {
          console.warn('Unable to send message (AccountFinder is shutting down).');
          return false;
        }
      }
    }
    */

    if (!this._messaging) {
      console.warn('Unable to send message (AccountFinder messaging is not ' +
        'ready');
      return false;
    }

    doc = msg.encode();

    return this._messaging.send(doc.writeAsJSON());
  };

  // TODO: Implement these methods (or equivalents)
  AccountFinder.prototype.sendRequest = function () {};
  AccountFinder.prototype.getCurrentFinder = function () {};
  // This evented API can likely be greatly simplified when implemented in
  // JavaScript
  AccountFinder.prototype.notifyFinderDNSComplete = function () {};
  AccountFinder.prototype.onStep = function () {};
  AccountFinder.prototype.onRUDPICESocketStateChanged = function () {};
  AccountFinder.prototype.onRUDPICESocketSessionStateChanged = function () {};
  AccountFinder.prototype.onRUDPICESocketSessionChannelWaiting = function () {};
  AccountFinder.prototype.onRUDPMessagingStateChanged = function () {};
  AccountFinder.prototype.onRUDPMessagingReadReady = function () {};
  AccountFinder.prototype.onRUDPMessagingWriteReady = function () {};
  AccountFinder.prototype.handleMessageMonitorResultReceived = function () {};
  AccountFinder.prototype.handleMessageMonitorErrorResultReceived = function () {};
  AccountFinder.prototype.handleMessageMonitorResultReceived = function () {};
  AccountFinder.prototype.handleMessageMonitorErrorResultReceived = function () {};
  AccountFinder.prototype.handleMessageMonitorResultReceived = function () {};
  AccountFinder.prototype.handleMessageMonitorErrorResultReceived = function () {};

  AccountFinder.prototype.getSocket = function () {};
  AccountFinder.prototype.step = function () {};
  AccountFinder.prototype.stepSocketSubscription = function () {};
  AccountFinder.prototype.stepSocketSession = function () {};
  AccountFinder.prototype.stepMessaging = function () {};
  AccountFinder.prototype.stepCreateSession = function () {};

  AccountFinder.prototype.setTimeout = function (delay) {
    var self = this;
    var timeoutID = this._keepAliveTimer = window.setTimeout(function () {
      self.keepAliveTimer(timeoutID);
    }, delay);
  };

  AccountFinder.prototype.onTimer = function (id) {
    if (!this._is('ready')) {
      return;
    }
    if (this._keepAliveTimer !== id) {
      return;
    }
    if (this._sessionKeepAliveMonitor) {
      return;
    }
    if (!this._outer) {
      console.warn('AccountFinder account object is undefined');
    }

    // TODO: Implement SessionCreateRequest and include as a dependency
    //var request = new SessionKeepAliveRequest();
    var request = {};
    request.setDomain(this._outer.getDomain());
    this._sessionKeepAliveMonitor = this.sendRequest(this, request, KEEPALIVE_TIMEOUT);
  };

  // TODO: Determine if intermediate 'shuttingdown' state is necessary for this
  // implementation.
  AccountFinder.prototype.shutdown = function () {
    if (this._is('shutdown')) {
      return;
    }
    this._setState('shuttingdown');

    if (this._keepAliveTimer) {
      this._keepAliveTimer.cancel();
      this._keepAliveTimer.reset();
    }

    if (this._sessionCreateMonitor) {
      this._sessionCreateMonitor.cancel();
      this._sessionCreateMonitor.reset();
    }

    if (this._sessionKeepAliveMonitor) {
      this._sessionKeepAliveMonitor.cancel();
      this._sessionKeepAliveMonitor.reset();
    }

    this._setState('shutdown');

    this._outer.reset();

    if (this._messaging) {
      this._messaging.shutdown();
      this._messaging.reset();
    }

    if (this._socketSession) {
      this._socketSession.shutdown();
      this._socketSession.reset();
    }

    if (this._sessionDeleteMonitor) {
      this._sessionDeleteMonitor.cancel();
      this._sessionDeleteMonitor.reset();
    }
  };

  return AccountFinder;
});
