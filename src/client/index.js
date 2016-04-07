require('./index.html');
require('./home.html');

document.addEventListener("DOMContentLoaded", function() {
  require('./about.js');
  require('expose?coding!./coding.js');
  require('expose?webrtc!./webrtc.js');
});
