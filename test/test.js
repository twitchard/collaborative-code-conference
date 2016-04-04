var expect = require('chai').expect;

var request = require("request");
var base_url = 'http://localhost:4444/';

var app = require('./../build/server/index.js');

describe('the app', function(){
  describe('GET /', function() {
    it('returns status code 200', function(done) {
      request.get(base_url, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        // console.log(response.request.uri.href);
        done();
      });
    });

    it('response body contains "a collaborative code conference tool"', function(done) {
      request.get(base_url, function(error, response, body) {
        expect(body).to.contain('a collaborative code conference tool');
        done();
      });
    });

    it('response body contains "Start Writing Code" button', function(done) {
      request.get(base_url, function(error, response, body) {
        expect(body).to.contain('Start Writing Code');
        app.closeServer();
        done();
      });
    });
  });
});
