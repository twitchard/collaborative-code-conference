/* global Twilio:true */

require('es6-promise').polyfill();
require('isomorphic-fetch');

var bsn = require("bootstrap.native");

var conversationsClient;
var activeConversation;
var previewMedia;
var identity;

// Check for WebRTC
if (!navigator.webkitGetUserMedia && !navigator.mozGetUserMedia) {
  alert('Video and audio is not available in your browser, but you can still use the collaborative editor!');
  document.querySelector('#connect').setAttribute('disabled', 'disabled');
  document.querySelector('#connect-dropdown').setAttribute('disabled', 'disabled');
}

var docName = window.location.pathname.slice(1);

function getConnectedConversationsClientFor(name) {
  // If the conversationsClient is currently listening,
  // stop before getting a new client and listening on that one
  if (conversationsClient && conversationsClient.isListening) {
    console.log('Stopping listening to', conversationsClient.identity);
    conversationsClient.unlisten();
  }

  return fetch('/token?identity=' + name)
    .then(function(response) {
      if (response.status >= 400) {
        throw new Error('Bad response from server');
      }
      return response.json();
    })
    .then(function(data) {
      identity = data.identity;
      var accessManager = new Twilio.AccessManager(data.token);

      // Check the browser console to see your generated identity.
      // Send an invite to yourself if you want!
      console.log(identity);

      // Create a Conversations Client and connect to Twilio
      conversationsClient = new Twilio.Conversations.Client(accessManager);
      return conversationsClient.listen();
    });
}

getConnectedConversationsClientFor(docName)
  .then(clientConnected, function(error) {
    console.log('Could not connect to Twilio:', error.message);
  });

// Successfully connected!
function clientConnected() {
  // document.getElementById('invite-controls').style.display = 'block';
  console.log("Connected to Twilio. Listening for incoming Invites as '", conversationsClient.identity, "'");

  conversationsClient.on('invite', function (invite) {
    console.log('Incoming invite from:', invite.from);

    // Show dialog asking to accept or decline invitation
    var accept = false;
    if (invite.from === docName) {
      accept = true;
    } else {
      accept = window.confirm('Accept video/audio connection from ' + invite.from + '?');
    }

    if (accept) {
      invite.accept().then(conversationStarted);
    } else {
      invite.reject();
    }
  });

  // Bind button to connect to audio/video conversation
  document.getElementById('connect').onclick = function() {
    new bsn.Button(document.querySelector('#connect'), 'loading');
    new bsn.Button(document.querySelector('#connect-dropdown'), 'loading');

    var docName = window.location.pathname.slice(1);
    var username = 'the-other-user'; //TODO: prompt user for their name

    console.log('Getting new conversations client');
    getConnectedConversationsClientFor(username)
      .then(function() {
        console.log('Got conversations client');
        if (activeConversation) {
          // Add a video/audio participant
          // activeConversation.invite(docName);
          alert('Only two participants supported at this time.');
        } else {
          var options = {};
          if (previewMedia) {
            console.log('Preview media already displayed');
            options.localMedia = previewMedia;
          }
          console.log('Sending invite to', docName);
          conversationsClient.inviteToConversation(docName, options).then(conversationStarted, function(error) {
            console.error('Unable to create conversation', error);
            // FIXME: show error to user, un-disable button, and change identity back to docName
          });
        }
      },
      function(error) {
        console.error('Could not connect to Twilio:', error.message);
      });
  };
}

// Conversation is live
function conversationStarted(conversation) {
  console.log('In an active Conversation');
  activeConversation = conversation;
  // Draw local video, if not already previewing
  if (!previewMedia) {
    conversation.localMedia.attach('#local-media');
  }

  // When a participant joins, draw their video on screen
  conversation.on('participantConnected', function (participant) {
    console.log("Participant '" + participant.identity + "' connected");
    participant.media.attach('#remote-media');
    toggleConnectButton();
  });

  // When a participant disconnects, note in log
  conversation.on('participantDisconnected', function (participant) {
    console.log("Participant '" + participant.identity + "' disconnected");
    toggleConnectButton();
  });

  // When the conversation ends, stop capturing local video
  conversation.on('disconnected', function (conversation) {
    console.log("Connected to Twilio. Listening for incoming Invites as '" + conversationsClient.identity + "'");
    conversation.localMedia.stop();
    conversation.disconnect();
    activeConversation = null;
  });
}

function toggleConnectButton() {
  var connectButton = document.querySelector('#connect');
  var connectDropdownButton = document.querySelector('#connect-dropdown');

  if (connectButton.hasAttribute('disabled') && connectButton.hasAttribute('data-original-text')) {
    new bsn.Button(connectButton, 'reset');
    connectButton.setAttribute('disabled', 'disabled'); //TODO: change this to 'Disconnect'
    connectDropdownButton.setAttribute('disabled', 'disabled');
  } else if (connectButton.hasAttribute('disabled')) {
    connectButton.removeAttribute('disabled');
    connectDropdownButton.removeAttribute('disabled');
  } else {
    connectButton.setAttribute('disabled', 'disabled'); //TODO: change this to 'Disconnect'
    connectDropdownButton.setAttribute('disabled', 'disabled');
  }
}

//  Local video preview
document.getElementById('button-preview').onclick = function () {
  if (!previewMedia) {
    previewMedia = new Twilio.Conversations.LocalMedia();
    Twilio.Conversations.getUserMedia().then(
    function (mediaStream) {
      previewMedia.addStream(mediaStream);
      previewMedia.attach('#local-media');
      // TODO: change button text to 'Stop My Camera'
    },
    function (error) {
      console.error('Unable to access camera and microphone', error);
    });
  } else {
    previewMedia.stop();
    previewMedia = null;
  }
};

module.exports = {
  conversationsClient: conversationsClient,
  activeConversation: activeConversation,
  previewMedia: previewMedia,
  identity: identity,
  docName: docName
};
