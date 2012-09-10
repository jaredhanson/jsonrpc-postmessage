define(['./remote',
        'postmessage',
        'events',
        'class'],
function(Remote, pm, Emitter, clazz) {
  
  function Channel(origin, win) {
    Emitter.call(this);
    this.origin = origin;
    this.location = win.location.toString();
    this.remote = new Remote(this);
    this._win = win;
    this._methods = {};
    
    var self = this;
    win.addEventListener('unload', function() {
      self.close();
    });
  }
  clazz.inherits(Channel, Emitter);
  
  Channel.prototype.expose = function(name, service) {
    if (!service && typeof name == 'object') {
      service = name;
      name = null;
    }

    if (typeof service == 'function') {
      this._methods[name] = service;
    } else if (typeof service == 'object') {
      var module = name ? name + '.' : '';
      for (var method in service) {
        if (typeof service[method] === 'function') {
          this._methods[module + method] = service[method];
        }
      }
    }
  }
  
  Channel.prototype.send = function(obj) {
    pm.send(JSON.stringify(obj), this.origin, this._win);
  }
  
  Channel.prototype.close = function() {
    this.emit('close');
  }
  
  Channel.prototype._m = function(data) {
    var obj;
    try {
      if ('string' == typeof data) {
        obj = JSON.parse(data);
      } else if ('object' == typeof data) {
        obj = data;
      }
    } catch(e) {
    }
    if (!obj) return;
    
    // TODO: Implement support for JSON-RPC 2.0
    if (obj.jsonrpc || (obj.id !== undefined && (obj.method || obj.result !== undefined || obj.error !== undefined))) {
      if (obj.result !== undefined || obj.error !== undefined) {
        this.emit('response', obj);
      } else if (obj.id !== null) {
        this.emit('request', obj);
        this._h(obj);
      } else {
        this.emit('notification', obj);
        this._h(obj);
      }
    }
  }
  
  Channel.prototype._h = function(req) {
    var self = this;
    function result(err, res) {
      // requests without an id are notifications, to which responses are
      // supressed
      if (req.id !== null) {
        if (err) { return self.send({ id: req.id, result: null, error: err.message }); }
        self.send({ id: req.id, result: res || null, error: null })
      }
    }

    var method = this._methods[req.method];
    if (typeof method == 'function') {
      var params = req.params || [];
      // push result function as the last argument
      params.push(result);

      // invoke the method
      try {
        method.apply(this, params);
      } catch (err) {
        result(err);
      }
    } else {
      result(new Error('Method Not Found'));
    }
  }
  
  return Channel;
});
