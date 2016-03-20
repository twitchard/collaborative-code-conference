// Load config vars
if (process.env.NODE_ENV != 'production') require('dotenv').load();
var log = require('loglevel');
log.setLevel(process.env.LOG_LEVEL || 'debug');
log.info('Log level set to', process.env.LOG_LEVEL);

// Web server dependencies
var http = require('http');
var express = require('express');
var app = express();
var path = require('path');

// Collaborative coding dependencies
// var browserChannel = require('browserchannel').server;
var WebSocketServer = require("ws").Server
var gulf = require('gulf');
var textOT = require('ot-text').type;

// WebRTC video/audio dependencies
var AccessToken = require('twilio').AccessToken;
var ConversationsGrant = AccessToken.ConversationsGrant;

/*
 *
 * Use an in-memory document store
 * i.e. documents are lost when server is restarted
 * TODO: change document store to redis or mongo some other persistent DB
 *
 *
 */
var documents = {};

/*
 *
 * Setup and use static content middleware
 *
 *
 */
var serve = express.static(path.join(__dirname, 'public'), { 'index': false });
app.use(serve);

/*
 *
 *
 * Setup routing:
 *  /           - Instructions and about page
 *  /token      - Generates and returns a Twilio token with Programmable Video capabilities
 *  /[docName]  - Connect to doc [docName], where [docName] is any non-empty string except 'token'
 *
 *
*/
// Handle / route
app.get('/', function(req, res) {
  // TODO: replace this with a nice homepage like talky.io:
  //  - instructions
  //  - single input box with sample document name
  //  - single button that goes to /[CONTENTS OF INPUT BOX]
  //  - link to github repo ("setup your own disposable code conference")
  //  - link to blog post
  res.send('This is the homepage!');
});

// Function for /token route
//
// Generate an Access Token for a chat application user - it generates a random
// username for the client requesting a token, and takes a device ID as a query
// parameter.
var getToken = function(request, response) {
  var identity = request.query.identity;

  // Create an access token which we will sign and return to the client,
  // containing the grant we just created
  var token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET
  );

  // Assign the generated identity to the token
  token.identity = identity;

  //grant the access token Twilio Video capabilities
  var grant = new ConversationsGrant();
  grant.configurationProfileSid = process.env.TWILIO_CONFIGURATION_SID;
  token.addGrant(grant);

  // Serialize the token to a JWT string and include it in a JSON response
  response.send({
    identity: identity,
    token: token.toJwt()
  });
};

// Handle the /[docName] route, where [docName]
// is any non-empty, URL-valid string except 'token'
var serveDocument = function(req, res, next) {
  if (req.path === '/token') {
    next();
  } else { // path is a document name
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
};

// Route between /[docName] and /token handlers
app.get(/\/.+/, [serveDocument, getToken]);

// Listen on configured port or 4444
var port   = process.env.PORT || 4444;
var env    = process.env.NODE_ENV || 'development';
var server = http.createServer(app);
server.listen(port);
log.info('Server running in', env, 'mode and listening on port', port);

/*
 *
 * Setup WebSocket server
 *
 *
 */
var wss = WebSocketServer({server: server});
log.info('WebSocket server created');

wss.on('connection', function(ws) {
  var docName = path.parse(ws.upgradeReq.url).base;
  log.debug('WebSocket connection established for', docName);

  // Setup WebSocket keepalive ping pongs
  var pingsSent = 0;
  ws.on('pong', function() { pingsSent = 0; });
  var pinger = setInterval(function() {
    if (pingsSent >= 2) {
      log.warn('Client not responding to ping. Closing WebSocket.');
      ws.close();
    } else {
      ws.ping('hello', null, true);
      pingsSent++;
    }
  }, 59*1000);

  var doc = null;
  if (docName in documents) { // Doc already exists
    log.debug('Requested doc exists', docName);
    doc = documents[docName];
  } else { // Doc doesn't yet exist
    log.debug('Creating new doc', docName);
    var docContents = require('./lib/instructions');

    doc = gulf.Document.create(new gulf.MemoryAdapter, textOT, docContents, function(er, doc) {
      if (er) { log.error('Error creating doc:', er); }

      // Attach some listeners for logging
      doc.on('init', function() { log.debug('New doc initialized', docName); });
      doc.on('edit', function() { log.debug('Edit received for doc', docName); });

      // Add doc to in-memory document store (i.e. dumb Object) :P
      // TODO: change document store to redis or mongo some other persistent DB
      documents[docName] = doc;
    });
  }

  // Create slave link to doc and pipe its data out to and in from WebSocket
  var link = doc.slaveLink();

  // Receive a change message from the doc
  link.on('data', function(data) {
    log.debug('Received message from LINK: %j', data);

    // Send the change message over the websocket
    ws.send(data, function(err) {
      if (err) { log.error('Error sending data to WebSocket', data, err); }
    });
  });

  // Log link errors to console
  link.on('error', function(error) {
    log.error('Error receiving data from link:', error);
  })

  // Receive a message from the websocket
  ws.on('message', function(data) {
    log.debug('Received message from client: %j', data);

    // Send the message to the link
    link.write(data);
  });

  ws.on('close', function(code, reason) {
    log.debug('WebSocket disconnected (', code, reason, ')');
    link.removeAllListeners();
    clearInterval(pinger);
  });
});
