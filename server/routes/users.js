var express = require('express');
//var router = express.Router();

/* GET users listing. */

module.exports = function(app, passport) {
  app.get('/login/facebook',
    passport.authenticate('facebook')
  );

  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login', successRedirect: '/home' }),
    function(req, res) {
      res.send(200);
    });
};
