// Load config vars
if (process.env.NODE_ENV != 'production') require('dotenv').load();

// Web server dependencies
var express = require('express');
var app = express();
var path = require('path');

// Collaborative coding dependencies
var browserChannel = require('browserchannel').server;
var gulf = require('gulf');
var textOT = require('ot-text').type;

// WebRTC video/audio dependencies
var AccessToken = require('twilio').AccessToken;
var ConversationsGrant = AccessToken.ConversationsGrant;

// TODO: change document store to redis or some other persistent DB
var documents = {};

/*
 *
 * Setup browser channel middleware
 *
 *
 */
var bs = browserChannel(function(session) {
  var sessionName = '' + session.id + '@' + session.address;
  var docName = path.parse(session.headers.referer).base;
  console.log('New session', sessionName, 'for doc', docName);

  var doc = null;
  if (docName in documents) { // Doc already exists
    console.log('Connecting user to existing doc', docName);
    doc = documents[docName];
  } else { // Doc doesn't yet exist
    // Create new doc with instructions
    console.log('Connecting user to new doc', docName);
    var docContents = require('./instructions');

    doc = gulf.Document.create(new gulf.MemoryAdapter, textOT, docContents, function(er, doc) {
      if (er) { console.log('Error creating doc:', er); }

      // attach some listeners for logging
      doc.on('init', function() { console.log('doc initialized'); });
      doc.on('edit', function() { console.log('edit received'); });

      // add doc to in-memory document store (i.e. dumb Object) :P
      // TODO: change document store to redis or some other persistent DB
      documents[docName] = doc;
    });
  }

  // create slave link to doc
  var link = doc.slaveLink();

  // Receive a change message from the doc
  link.on('data', function(data) {
    console.log('Received message from LINK: %j', data);

    // Send the change message over the browser channel
    session.send(data);
  });

  // Log link errors to console
  link.on('error', function(error) {
    console.error('Error receiving data from link: ', error);
  })

  // Receive a message from the browser channel
  session.on('message', function(data) {
    console.log('Received message from client ' + sessionName + ': %j', data);

    // Send the message to the link
    link.write(data);
  });

  session.on('close', function(reason) {
    console.log(sessionName + ' disconnected (' + reason + ')');
  });
});

/*
 *
 * Setup static content middleware
 *
 *
 */
var serve = express.static(path.join(__dirname, 'public'), { 'index': false });

/*
 *
 * add Browserchannel and static middleware.
 *
 *
 */
app.use(bs);
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

// Handle /[docName] requests
var serveDocument = function(req, res, next) {
  if (req.path === '/token') {
    next();
  } else { // path is a document name
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
};

// Switch between /[docName] and /token handlers
app.get(/\/.+/, [serveDocument, getToken]);

// Listen on configured port or 4444
var port = process.env.PORT || 4444;
var env = process.env.NODE_ENV || 'development';
app.listen(port, function() {
  console.log('Server running in', env, 'mode and listening on port', port);
});
