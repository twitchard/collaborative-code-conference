var bsn = require("bootstrap.native");

// Get trigger link
var link = document.querySelector('#logo-link');

// Init modal
var modal = new bsn.Modal('#aboutModal');

// Show modal on click
link.addEventListener('click', function(event) {
  event.preventDefault();
  modal.open();
});
