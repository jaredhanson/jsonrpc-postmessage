define(function() {
  
  function Remote(channel) {
    this.timeout = 5000;
    this._channel = channel;
    this._handlers = {};
    this._requestID = 1;

    var self = this;
    this._channel.on('response', function(res) {
      if (res.id === null || res.id === undefined) return;
      var handler = self._handlers[res.id];
      if (handler) { handler.call(self, res.error, res.result); }
      delete self._handlers[res.id];
    });
  }
  
  Remote.prototype.call = function(method, params, cb) {
    var params = Array.prototype.slice.call(arguments);
    var method = params.length ? params.shift() : null;
    var cb = (params.length && typeof params[params.length - 1] == 'function') ? params.pop() : null;

    var req = {
      id: this._requestID++,
      method: method,
      params: params
    }
    this._handlers[req.id] = cb;

    var self = this;
    setTimeout(function() {
      var handler = self._handlers[req.id];
      if (handler) { handler.call(self, new Error('Timed Out')); }
      delete self._handlers[req.id];
    }, this.timeout);

    this._channel.send(req);
  }
  
  return Remote;
});
