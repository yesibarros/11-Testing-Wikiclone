
console.log("Arrancando con los Tests")

var chai = require('chai');
var spies = require('chai-spies');
chai.use(spies);
var expect = require('chai').expect;

describe('Testeando las capacidades del test', function () {
  it('confirma aritmética básica', function () {
    expect(2+2).to.equal(4);
  });

  // Usefull for optimize queries efficiency
  it('confirma la precisión del timer de setTimeout\'s', function (done) {
    var start = new Date();
    setTimeout(function () {
      var duration = new Date() - start;
      expect(duration).to.be.closeTo(1000, 50); //https://www.chaijs.com/api/bdd/#method_closeto
      done();
    }, 1000);
  });

  it('va invocar la función por cada elemento', function () {
    var arr = ['x','y','z'];
    function logNth (val, idx) {
      console.log('Logging elem #'+idx+':', val);
    }
    logNth = chai.spy(logNth);
    arr.forEach(logNth);
    expect(logNth).to.have.been.called.exactly(arr.length);
  });


});
