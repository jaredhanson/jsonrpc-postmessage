define(['exports',
        './lib/listener'],
function(exports, Listener) {
  
  var listener = new Listener();

  function listen(channelListener) {
    if (channelListener) { listener.on('channel', channelListener); }
    listener.listen();
    return listener;
  }

  exports.listen = listen;
});
