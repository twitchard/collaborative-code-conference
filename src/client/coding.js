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
require('codemirror/mode/vb/vb');

// FIXME: figure out how to makes the themes configurable
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
require('./index.css');

require('codemirror/mode/meta');

require('codemirror/addon/display/fullscreen.js');
require('codemirror/addon/display/fullscreen.css');

var bindEditor = require('gulf-codemirror');

var opts = {
  'lineNumbers': true,
  'autofocus': true,
  'fullScreen': true,
  'mode': 'javascript',
  'theme': 'solarized dark'
};
var editor = document.querySelector('#editor');
var cm = CodeMirror(editor, opts);
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
modeSelector.add(new Option('VB.NET', 'text/x-vb')); //vb

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

var editableDoc = bindEditor(cm);
var link = editableDoc.masterLink();

var loc = location.href.replace(/^http/, 'ws')
var ws = new WebSocket(loc);
ws.onopen = function() {
  console.log('WebSocket opened');

  // Document change, send to server
  link.on('data', function(data) { ws.send(data); });

  // Receive change from server, send to link
  ws.onmessage = function(event) { link.write(event.data); };

  ws.onclose = function() {
    document.querySelector('#editor-connection-status').style.visibility = 'visible';
  };
};

// Load gist in editor
//
// on click of 'Load GitHub Gist' button, show modal asking for gist url or id
var gister = require('./gister');
var loadGistButton = document.getElementById('load-gist');
loadGistButton.onclick = function() {
  // modal text: "What is the gist URL? This will replace all text in the editor with the contents of the gist."
  // modal buttons: 'Load' and 'Cancel'
  // - on cancel, close modal
  var url = 'https://gist.github.com/crcastle/7f34cf4ad33d5c67e05d';

  // - on load, show spinner while getting gist from github api
  gister.getGist(url)
  .then(function(data) {
    // - if 1 file, ask if ok to overwrite editor contents
    // - if >1 file, ask to click on 1 file name
    // cm.setValue(newContents);
    cm.setValue(data.files[Object.keys(data.files)[0]].content);
  });
};

module.exports = {
  CodeMirror: CodeMirror,
  cm: cm,
  editableDoc: editableDoc,
  link: link,
  gister: gister
};
