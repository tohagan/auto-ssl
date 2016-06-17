'use strict';

// May eventually replace with a nginx front end built with LE support:
// - https://github.com/JrCs/docker-letsencrypt-nginx-proxy-companion

var path = require('path');
var config = require('./config').ssl;
var app = require('./app')(config.redirect);

console.log(JSON.stringify(config));

// Reference: https://letsencrypt.org/ AND https://github.com/Daplie/letsencrypt-express

if (config.enabled) {
  var LEX = require('letsencrypt-express');
  var certsDir = path.resolve(config.certsDir, config.prod ? 'prod' : 'staging');

  if (!config.prod) {
    // Creates "fake" SSL certificates that work ok but will fail CA root cert validation.
    // Uses LE staging server to avoid 5 certs/week/domain rate limit (letsencrypt.org/docs/rate-limits/)
    LEX = LEX.testing();  
  }

  // Every hour (3600 seconds) the certificates are checked and every certificate
  // that will expire in the next 30 days (90 days / 3) are auto-renewed.
  var lex = LEX.create({
    configDir: certsDir,
    onRequest: app,
    approveRegistration: function (hostname, approve) { // leave `null` to disable automatic registration
      if (config.domains.indexOf(hostname) > -1) { // Or check a database or list of allowed domains
        approve(null, {
          domains: config.domains,
          email: config.email,
          agreeTos: true
        });
      }
    }
  });

  lex.listen(config.plainPorts, config.tlsPorts);

} else {

  // Unsecured ports only
  config.plainPorts.forEach(function(port) {
    app.listen(port, function () {
      console.log('Hello app listening on port: ' + port);
    });
  });

}
