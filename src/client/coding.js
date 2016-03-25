var bsn = require("bootstrap.native");
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
require('codemirror/mode/shell/shell');
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
  'fullScreen': true
};
var editor = document.querySelector('#editor');
var cm = CodeMirror(editor, opts);

// Populate Language drop-down
var modeSelector = document.querySelector('#language-dropdown');
function languageListItem(name, mime) {
  var li     = document.createElement('li');
  var anchor = li.appendChild(document.createElement('a'));
  anchor.appendChild(document.createTextNode(name));
  anchor.setAttribute('id', name.replace(/\//g, '-'));
  anchor.setAttribute('data-mime', mime);
  anchor.setAttribute('href', '#');
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    cm.setOption('mode', mime);
    document.querySelector('#language-button-text').innerHTML = 'Language: ' + name;
    cm.focus();
  });
  return li;
}
var languages = [
  { name: 'C',            mime: 'text/x-csrc' },
  { name: 'C++',          mime: 'text/x-c++src' },
  { name: 'C#',           mime: 'text/x-csharp' },
  { name: 'CSS',          mime: 'text/css' },
  { name: 'Go',           mime: 'text/x-go' },
  { name: 'HTML',         mime: 'text/html' },
  { name: 'Java',         mime: 'text/x-java' },
  { name: 'JavaScript',   mime: 'text/javascript' },
  { name: 'Markdown',     mime: 'text/x-markdown' },
  { name: 'Objective-C',  mime: 'text/x-objectivec' },
  { name: 'Perl',         mime: 'text/x-perl' },
  { name: 'PHP',          mime: 'text/x-php' },
  { name: 'Ruby',         mime: 'text/x-ruby' },
  { name: 'Shell',        mime: 'text/x-sh' },
  { name: 'XML',          mime: 'application/xml' },
  { name: 'VB.NET',       mime: 'text/x-vb' }
]
for (var i = 0; i < languages.length; i++) {
  modeSelector.appendChild(languageListItem(languages[i].name, languages[i].mime));
}
document.querySelector('#JavaScript').click();

// Populate theme drop-down
var themeSelector = document.querySelector('#theme-dropdown');
themeSelector.style.width = '11em';
function themeListItem(name, classPrefix) {
  var li     = document.createElement('li');
  var anchor = li.appendChild(document.createElement('a'));
  anchor.appendChild(document.createTextNode(name));
  anchor.setAttribute('id', classPrefix.replace(/ /g, '-'));
  anchor.setAttribute('href', '#');
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    cm.setOption('theme', classPrefix);
    document.querySelector('#theme-button-text').innerHTML = 'Theme: ' + name;
    cm.focus();
  });
  return li;
}
var themes = [
  { name: 'Base16 Dark',      classPrefix: 'base16-dark' },
  { name: 'Base16 Light',     classPrefix: 'base16-light' },
  { name: 'Cobalt',           classPrefix: 'cobalt' },
  { name: 'Eclipse',          classPrefix: 'eclipse' },
  { name: 'Material',         classPrefix: 'material' },
  { name: 'Monokai',          classPrefix: 'monokai' },
  { name: 'Neat',             classPrefix: 'neat' },
  { name: 'Solarized Dark',   classPrefix: 'solarized dark' },
  { name: 'Solarized Light',  classPrefix: 'solarized light' },
  { name: 'Yeti',             classPrefix: 'yeti' },
  { name: 'Zenburn',          classPrefix: 'zenburn' }
];
for (var j = 0; j < themes.length; j++) {
  themeSelector.appendChild(themeListItem(themes[j].name, themes[j].classPrefix));
}
document.querySelector('#solarized-dark').click();

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
var Gister = require('./gister');
var g = new Gister();
var loadGistButton   = document.querySelector('#load-gist');
var createGistButton = document.querySelector('#create-gist');
loadGistButton.addEventListener('click', g.loadGistModal.bind(g));
createGistButton.addEventListener('click', g.createGistModal.bind(g));
new bsn.Popover(createGistButton, {trigger: 'click'});  //handle 'create' not implemented yet

// Listen for gist instance to emit file events that we then put in the editor
g.on('file', function(file) {
  cm.setValue(file);
});


module.exports = {
  CodeMirror: CodeMirror,
  cm: cm,
  editableDoc: editableDoc,
  link: link,
  bsn: bsn
};
