var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'cis550.ct0tijtcbfhx.us-east-1.rds.amazonaws.com',
  user: 'team12',
  password: 'cis550-team12',
  port: '3306',
  database: 'cis550'
});

// var connection = mysql.createConnection({
//   host: 'cis550hw1.ctlq74kqmuns.us-east-1.rds.amazonaws.com',
//   port: 1521,
//   user: 'student',
//   password: 'cis550hw1',
//   database: 'ORCL'
// });

connection.connect(function(err) {
  if (!err) {
    console.log('DB connected!');
  } else {
    console.log('Error connecting to DB', err.stack);
  }
})

/* GET home page. */
router.get('/', function(req, res, next) {
    res.send(200);
});

router.get('/test', function(req, res, next) {
  var mysql = require('mysql');
  var connection = mysql.createConnection({
    host: 'cis550.ct0tijtcbfhx.us-east-1.rds.amazonaws.com',
    port: '3306',
    user: 'team12',
    password: 'cis550-team12',
    database: 'cis550'
  });
  res.json([{
    id: 1,
    username: "testing"
  }, {
    id: 2,
    username: "123"
  }]);
});

module.exports = router;
