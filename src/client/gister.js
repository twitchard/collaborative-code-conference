require('es6-promise').polyfill();
require('isomorphic-fetch');
var bsn = require("bootstrap.native");
const EventEmitter = require('events');
const util = require('util');


function Gister() {
  EventEmitter.call(this);
}
util.inherits(Gister, EventEmitter);

Gister.prototype.loadGistModal = function() {
  var frame = document.querySelector('#gistModal');
  var modalBody   = '<p>What is the gist URL? All text in the editor will be '
                    +'replaced with the gist content.</p>'
                    +'<input style="width: 100%;" id="gist-url" type="text">';

  var modal = createModal(frame, 'Load Gist', modalBody, 'Load');
  modal.open();

  var loadButton = modal.modal.querySelector('.btn-primary');
  var myself = this;
  loadButton.addEventListener('click', function(e) {
    new bsn.Button(e.target, 'loading');
    var url = document.querySelector('#gist-url').value;
    getGistFiles(url)
      .then(function(files) {
        var fileNames = Object.keys(files);
        var fileCount = fileNames.length;
        if (fileCount === 1) {
          myself.emit('file', files[fileNames[0]].content);
          modal.close();
        } else if (fileCount > 1) {
          var list = '';
          for (var fileName in files) {
            list += '<li><a href="#">' + fileName + '</a></li>';
          }

          updateModalBody(modal,
            modalBody + '<br><br><p>Which file from the gist?</p><ul>' + list + '</ul>');

          // Clicking on a link loads the gist file
          var links = modal.modal.querySelectorAll('a');
          for (var i = 0; i < links.length; i++) {
            links[i].addEventListener('click', function(e) {
              e.preventDefault();
              myself.emit('file', files[e.target.innerHTML].content);
              modal.close();
            });
          }

          document.querySelector('#gist-url').value = url;
          new bsn.Button(e.target, 'reset');
        } else {
          var error = 'No files found in gist.';
          updateModalBody(modal,
            modalBody + '<h5 style="color: #aa2222;">' + error + '</h5>');
          document.querySelector('#gist-url').value = url;
          new bsn.Button(e.target, 'reset');
        }
      })
      .catch(function(error) {
        updateModalBody(modal,
          modalBody + '<h5 style="color: #aa2222;">' + error + '</h5>');
        document.querySelector('#gist-url').value = url;
        new bsn.Button(e.target, 'reset');
        throw error;
      });
  });
}

Gister.prototype.createGistModal = function() {
  // var frame = document.querySelector('#gistModal');
  // var modalBody   = '<p>This is where you fill up content you know, etc.</p>';
  //
  // createModal(frame, 'Save to Gist', modalBody, 'Save').open();
}

function getGistFiles(gistUrl) {
  var pieces = gistUrl.split('/');
  var gistId = pieces[pieces.length-1];
  return fetch('https://api.github.com/gists/' + gistId)
    .then(function(response) {
      if (response.status >= 400) {
        throw new Error(response.statusText + ' (' + response.status + ')');
      }
      return response.json();
    })
    .then(function(data) {
      return data.files ? data.files : {};
    });
}

function createModal(frameSelector, title, body, submitText) {
  return new bsn.Modal(frameSelector, {
    content:
    '<div class="modal-header">'
    +'<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>'
    +'<h4 class="modal-title" id="gridModalLabel">'+title+'</h4>'
    +'</div>'
    +'<div class="modal-body">'
    + body
    +'</div>'
    +'<div class="modal-footer">'
    +'<button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>'
    +'<button type="button" class="btn btn-primary" data-loading-text="Loading...">'+submitText+'</button>'
    +'</div>'
  });
}

function updateModalBody(modal, content) {
  modal.modal.querySelector('.modal-body').innerHTML = content;
}

module.exports = Gister;

// loadGistButton.onclick = function() {
//   // modal text: "What is the gist URL? This will replace all text in the editor with the contents of the gist."
//   // input box: for gist url or id
//   // modal buttons: 'Load' and 'Cancel'
//   // - on cancel, close modal
//   var url = 'https://gist.github.com/crcastle/7f34cf4ad33d5c67e05d';
//
//   // - on load, show spinner while getting gist from github api
//   gister.getGistFiles(url)
//     .then(function(files) {
//       var fileNames = Object.keys(files);
//       var fileCount = fileNames.length;
//       var newContent = null;
//       if (fileCount == 1) {
//         newContent = files[fileNames[0]].content;
//       } else if (fileCount > 1) {
//         // ask which file, then load it
//         // var idx =
//         // newContent = files[fileNames[idx]].contents;
//       } else {
//         // message to user no files found in gist
//       }
//       cm.setValue(newContent);
//       cm.focus();
//     })
//     .catch(function(error) {
//       throw new Error(error);
//     });
// };
