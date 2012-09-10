define(['./channel',
        'postmessage',
        'class'],
function(Channel, pm, clazz) {
  
  function Listener() {
    pm.Listener.call(this);
    this._channels = {};
  }
  clazz.inherits(Listener, pm.Listener);
  
  Listener.prototype.listen = function() {
    var self = this;
    this.on('message', function(data, origin, win) {
      var loc = win.location.toString();
      var c = this._channels[loc];
      if (!c) {
        c = new Channel(origin, win);
        this._channels[loc] = c;
        c.on('close', function() {
          delete self._channels[loc];
        });
        
        self.emit('channel', c, c.remote);
      }
      c._m(data);
    });
    pm.Listener.prototype.listen.call(this);
  }
  
  return Listener;
});
