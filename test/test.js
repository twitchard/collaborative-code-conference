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

  describe('GET /token', function() {
    var error    = null,
        response = null,
        body     = null,
        jsonBody = null;

    var identity = 'test-identity';
    var url = base_url + 'token?identity=' + identity;

    before('request GET /token', function(done) {
      request.get(url, function(err, res, bod) {
        error    = err;
        response = res;
        body     = bod;
        jsonBody = JSON.parse(body);
        done();
      });
    });

    it('returns status code 200', function() {
      expect(response.statusCode).to.equal(200);
    });

    it('contains keys identity and token', function() {
      expect(jsonBody).to.have.keys(['identity', 'token']);
    });

    it('identity value matches that provided in request query string', function() {
      expect(jsonBody.identity).to.equal(identity);
    });
  });

  after(function() {
    app.closeServer();
  });
});
