define(['jsonrpc-postmessage/main',
        'chai'],
function(jsonrpcpm, chai) {
  var expect = chai.expect;

  describe("jsonrpc-postmessage", function() {
    
    it('shoud export listen', function() {
      expect(jsonrpcpm.listen).to.exist;
      expect(jsonrpcpm.listen).to.be.a('function');
    });
    
  });
  
  return { name: "test.jsonrpc-postmessage" }
});
