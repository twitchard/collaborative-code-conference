/* global Twilio:true BCSocket:true */

require('es6-promise').polyfill();
require('isomorphic-fetch');

var CodeMirror = require('codemirror');

// these are dependencies to other modes;
// they need to load before those other modes
// FIXME: figure out how to makes the languages configurable
// FIXME: figure out how to not duplicate code: languages are named here plus
//  in drop-down setup code below
require('codemirror/mode/xml/xml');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/css/css');
require('codemirror/mode/clike/clike');

require('codemirror/mode/go/go');
require('codemirror/mode/htmlmixed/htmlmixed');
require('codemirror/mode/markdown/markdown');
require('codemirror/mode/perl/perl');
require('codemirror/mode/php/php');
require('codemirror/mode/ruby/ruby');

// FIXME: figure out how to load CSS theme files here instead of in index.html
// FIXME: figure out how to not duplicate code listing themes here and select menu options below
require('./codemirror.css');
require('codemirror/theme/base16-dark.css');
require('codemirror/theme/base16-light.css');
require('codemirror/theme/cobalt.css');
require('codemirror/theme/eclipse.css');
require('codemirror/theme/material.css');
require('codemirror/theme/monokai.css');
require('codemirror/theme/neat.css');
require('codemirror/theme/solarized.css');
require('codemirror/theme/yeti.css');
require('codemirror/theme/zenburn.css');

require('codemirror/mode/meta');

var bindEditor = require('gulf-codemirror');

var editableDoc = null;
document.addEventListener("DOMContentLoaded", function() {
  loadCoding();
  loadWebRtc();
});

function loadWebRtc() {
  var conversationsClient;
  var activeConversation;
  var previewMedia;
  var identity;

  // Check for WebRTC
  if (!navigator.webkitGetUserMedia && !navigator.mozGetUserMedia) {
    alert('WebRTC is not available in your browser.');
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
      var docName = window.location.pathname.slice(1);
      var username = 'bob'; //TODO: prompt user for their name

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
            });
          }
        },
        function(error) {
          console.error('Could not connect to Twilio:', error.message);
        });
    };
    // document.getElementById('button-invite').onclick = function () {
    //   var inviteTo = document.getElementById('invite-to').value;
    //   if (activeConversation) {
    //     // Add a participant
    //     activeConversation.invite(inviteTo);
    //   } else {
    //     // Create a conversation
    //     var options = {};
    //     if (previewMedia) {
    //       options.localMedia = previewMedia;
    //     }
    //     conversationsClient.inviteToConversation(inviteTo, options).then(conversationStarted, function (error) {
    //       log('Unable to create conversation');
    //       console.error('Unable to create conversation', error);
    //     });
    //   }
    // };
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
    });

    // When a participant disconnects, note in log
    conversation.on('participantDisconnected', function (participant) {
      console.log("Participant '" + participant.identity + "' disconnected");
    });

    // When the conversation ends, stop capturing local video
    conversation.on('disconnected', function (conversation) {
      console.log("Connected to Twilio. Listening for incoming Invites as '" + conversationsClient.identity + "'");
      conversation.localMedia.stop();
      conversation.disconnect();
      activeConversation = null;
    });
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

  // Activity log
  // function log(message) {
  //   // document.getElementById('log-content').innerHTML = message;
  //   console.log(message);
  // }
}

function loadCoding() {
  var opts = {
    'lineNumbers': true,
    'autofocus': true
  };
  var editor = document.querySelector('#editor');
  var cm = CodeMirror(editor, opts);
  cm.setOption('mode', 'plain text');
  var modeSelector = document.querySelector('#mode-selector');
  modeSelector.addEventListener('change', function(event) {
    cm.setOption('mode', event.target.value);
    cm.focus();
  });
  modeSelector.add(new Option('C', 'text/x-csrc')); //clike
  modeSelector.add(new Option('C++', 'text/x-c++src')); //clike
  modeSelector.add(new Option('C#', 'text/x-csharp')); //clike
  modeSelector.add(new Option('CSS', 'text/x-csharp')); //css
  modeSelector.add(new Option('Go', 'text/x-go')); //go
  modeSelector.add(new Option('HTML', 'text/html')); //htmlmixed
  modeSelector.add(new Option('Java', 'text/x-java')); //clike
  modeSelector.add(new Option('JavaScript', 'text/javascript')); //javascript
  modeSelector.add(new Option('Markdown', 'text/x-markdown')); //markdown
  modeSelector.add(new Option('Objective-C', 'text/x-objectivec')); //clike
  modeSelector.add(new Option('Perl', 'text/x-perl')); //perl
  modeSelector.add(new Option('PHP', 'text/x-php')); //php
  modeSelector.add(new Option('Ruby', 'text/x-ruby')); //ruby
  modeSelector.add(new Option('XML', 'application/xml')); //xml

  var themeSelector = document.querySelector('#theme-selector');
  themeSelector.addEventListener('change', function(event) {
    cm.setOption('theme', event.target.value);
    cm.focus();
  });
  themeSelector.add(new Option('Base16 Dark', 'base16-dark'));
  themeSelector.add(new Option('Base16 Light', 'base16-light'));
  themeSelector.add(new Option('Cobalt', 'cobalt'));
  themeSelector.add(new Option('Eclipse', 'eclipse'));
  themeSelector.add(new Option('Material', 'material'));
  themeSelector.add(new Option('Monokai', 'monokai'));
  themeSelector.add(new Option('Neat', 'neat'));
  themeSelector.add(new Option('Solarized Dark', 'solarized dark'));
  themeSelector.add(new Option('Solarized Light', 'solarized light'));
  themeSelector.add(new Option('Yeti', 'yeti'));
  themeSelector.add(new Option('Zenburn', 'zenburn'));

  editableDoc = bindEditor(cm);
  var link = editableDoc.masterLink();


  var socket = new BCSocket('/channel', { reconnect: true });
  socket.onopen = function() {
    console.log('socket opened');

    link.on('data', function(data) {
      console.log('got a message from LINK: ', data)

      socket.send(data);
    });
  };
  socket.onmessage = function(message) {
    console.log('got a message from SERVER: ', message);

    link.write(message.data);
  };
}
