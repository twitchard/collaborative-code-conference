var expect = require('chai').expect;

var request = require("request");
var base_url = 'http://localhost:4444/';

var app = require('./../build/server/index.js');


describe('the app', function() {
  describe('GET /', function() {
    var error    = null,
        response = null,
        body     = null;

    before('request GET /', function(done) {
      request.get(base_url, function(err, res, bod) {
        error    = err;
        response = res;
        body     = bod;
        done();
      });
    });

    after(function() {
      app.closeServer();
    });

    it('returns status code 200', function() {
      expect(response.statusCode).to.equal(200);
    });

    it('response body contains "a collaborative code conference tool"', function() {
      expect(body).to.contain('a collaborative code conference tool');
    });

    it('response body contains "Start Writing Code" button', function() {
      expect(body).to.contain('Start Writing Code');
    });
  });
});
