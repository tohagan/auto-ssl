'use strict';

module.exports = function(sslRedirect) {

  // Bare bones Express server to test Docker
  var express = require('express');
  var app = express();

  // Force HTTPS redirect unless we are using localhost or unit testing with superagent.
  function httpsRedirect(req, res, next) {
    if (req.protocol === 'https'
      || req.header('X-Forwarded-Proto') === 'https'
      || req.header('User-Agent').match(/^node-superagent/)
      || req.hostname === 'localhost') {
      return next();
    }

    res.status(301).redirect("https://" + req.headers.host + req.url);
  }

  if (sslRedirect) {
    app.use(httpsRedirect);
  }

  app.get('/', function (req, res) {
    res.send(
      [
        'Oh man! You would not believe where I\'ve been just now.',
        'To bring you this warm intercontinental "Hello" greeting',
        'I had to first have my text squeezed up, then climb into an SSL encrypted network tunnel',
        '(to avoid the gruesome caching proxies and "middle man" attackers) jump through endless routers and ',
        'those evil switches that chopped me up into smaller packets',
        'only to get encoded again into a light beam and travel at near light speed underneath thousands of kilometers of ocean',
        'inside a tiny fibre optic tube before getting decoded back into electrons, then yet more switches and routers ',
        'that reassembled my packets again and then safe inside your computer be decrypted, then un-squeezed and ',
        'finally be splattered on your screen - all in a rather undignified font I should add !<br/>',
        'Sigh ... The things I do to be together with you.'
      ].join(' '));
  });

  app.get('/env', function (req, res) {
    res.contentType('application/json');
    res.send(process.env);
  });
  
  return app;

};