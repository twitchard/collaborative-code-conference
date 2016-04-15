var expect = require('chai').expect;

var request = require("request");
var base_url = 'http://localhost:4444/';

var app = require('./../build/server/index.js');


describe('the app', () => {
  describe('GET /', () => {
    var error    = null,
        response = null,
        body     = null;

    before('request GET /', done => {
      request.get(base_url, (err, res, bod) => {
        error    = err;
        response = res;
        body     = bod;
        done();
      });
    });


    it('returns status code 200', () => {
      expect(response.statusCode).to.equal(200);
    });

    it('response body contains "a collaborative code conference tool"', () => {
      expect(body).to.contain('a collaborative code conference tool');
    });

    it('response body contains "Start Writing Code" button', () => {
      expect(body).to.contain('Start Writing Code');
    });
  });

  describe('GET /token', () => {
    var error    = null,
        response = null,
        body     = null,
        jsonBody = null;

    var identity = 'test-identity';
    var url = `${base_url}token?identity=${identity}`;

    before('request GET /token', done => {
      request.get(url, (err, res, bod) => {
        error    = err;
        response = res;
        body     = bod;
        jsonBody = JSON.parse(body);
        done();
      });
    });

    it('returns status code 200', () => {
      expect(response.statusCode).to.equal(200);
    });

    it('contains keys identity and token', () => {
      expect(jsonBody).to.have.keys(['identity', 'token']);
    });

    it('identity value matches that provided in request query string', () => {
      expect(jsonBody.identity).to.equal(identity);
    });
  });

  var docName = 'testroom';
  describe(`GET /${docName}`, () => {
    var error    = null,
        response = null,
        body     = null;

    var url = base_url + docName;

    before(`request GET /${docName}`, done => {
      request.get(url, (err, res, bod) => {
        error    = err;
        response = res;
        body     = bod;
        done();
      });
    });


    it('returns status code 200', () => {
      expect(response.statusCode).to.equal(200);
    });

    it('includes an editor div', () => {
      expect(body).to.include('<div id="editor">');
    });

    it('includes a conf div', () => {
      expect(body).to.include('<div id="conf">');
    });

    it('includes a code-options div', () => {
      expect(body).to.include('<div id="code-options">');
    });
  });

  after( () =>{
    app.closeServer();
  });
});
