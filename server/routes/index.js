var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var connection = mysql.createConnection({
  host: process.env.AWS_MYSQL_HOSTNAME,
  user: process.env.AWS_MYSQL_USERNAME,
  password: process.env.AWS_MYSQL_PASSWORD,
  port: process.env.AWS_MYSQL_PORT,
  database: process.env.AWS_MYSQL_DATABASE
});

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
  connection.query('select * from rent limit 10', function(err, results, fields) {
    if (err) {
      console.log('error: ', err);
    } else {
      console.log('sucessss', results);
    }
  })
  res.json([{
    id: 1,
    username: "testing"
  }, {
    id: 2,
    username: "123"
  }]);
});

module.exports = router;
