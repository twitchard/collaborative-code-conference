require('es6-promise').polyfill();
require('isomorphic-fetch');

module.exports = {
  getGist: function(gistUrl) {
    var pieces = gistUrl.split('/');
    var gistId = pieces[pieces.length-1];
    return fetch('https://api.github.com/gists/' + gistId)
      .then(function(response) {
        if (response.status >= 400) {
          throw new Error('Bad response from server');
        }
        return response.json();
      });
  }
}
