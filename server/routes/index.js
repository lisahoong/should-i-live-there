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
var aws = require('aws-sdk');
aws.config.update({region: 'us-east-1'});
var nosql = new aws.DynamoDB();

connection.connect(function(err) {
  if (!err) {
    console.log('DB connected!');
  } else {
    console.log('Error connecting to DB', err.stack);
  }
})

router.get('/', function(req, res, next) {
  res.send(200);
});

router.post('/check', function(req, res) {

  var a = new Promise(function(resolve, reject) {
    connection.query(`SELECT rent
      FROM rent
      WHERE zip=${req.body.zip} AND bedrooms=${req.body.bed}`, function(err, results) {
        if (err) {
          console.log('error: ', err);
          return reject(err);
        } else {
          return resolve(results);
        }
      })
    })

    var b = new Promise(function(resolve, reject) {
      connection.query(`SELECT business_type, business_count FROM businesses
        WHERE zip_biz=${req.body.zip} AND business_type <> "Garage" AND
        business_type <> "Parking Lot" UNION SELECT name, 1 as count
        FROM restaurants WHERE zip_rest=${req.body.zip}`, function(err, results) {
          if (err) {
            console.log('error: ', err);
            return reject(err);
          } else {
            return resolve(results);
          }
        })
      });

      var c = new Promise(function(resolve, reject) {
        connection.query(`SELECT crime_type, crime_count FROM policeComplaints
          WHERE zip_crime=${req.body.zip} UNION SELECT complaint_type, complaint_count
          FROM serviceRequests WHERE zip_311=${req.body.zip} AND complaint_type="Noise"`,
          function(err, results) {
            if (err) {
              console.log('error: ', err);
              return reject(err);
            } else {
              return resolve(results);
            }
          })
        })

        var d = new Promise(function(resolve, reject) {
          connection.query(`SELECT complaint_type, complaint_count
            FROM serviceRequests
            WHERE zip_311=${req.body.zip} AND
            (complaint_type='AirQuality' OR complaint_type='NeighborhoodDisrepair')
            UNION
            SELECT 'WaterQuality' as water_quality, water_count
            FROM waterComplaints
            WHERE zip_water=${req.body.zip}`,
            function(err, results) {
              if (err) {
                console.log('error: ', err);
                return reject(err);
              } else {
                return resolve(results);
              }
            })
          })

          var e = new Promise(function(resolve, reject) {
            connection.query(`SELECT business_type, business_count
              FROM businesses
              WHERE zip_biz=${req.body.zip} AND
              (business_type="Garage" OR business_type="Parking Lot")`,
              function(err, results) {
                if (err) {
                  console.log('error: ', err);
                  return reject(err);
                } else {
                  return resolve(results);
                }
              })
            })

            var f = new Promise(function(resolve, reject) {
              connection.query(`SELECT * FROM demo WHERE zip_demo=${req.body.zip}`,
                function(err, results) {
                  if (err) {
                    console.log('error: ', err);
                    return reject(err);
                  } else {
                    return resolve(results);
                  }
                })
              })


              // var g = new Promise(function(resolve, reject) {
              //   nosql.scan({TableName: 'subway'}, function(err, data) {
              //     if (err) {
              //       return reject(err);
              //     } else {
              //       console.log('data: ', data.Items);
              //       return resolve(data);
              //     }
              //   })
              // });


                Promise.all([a, b, c, d, e, f]).then(function(resp) {
                  var data = {};
                  data.avgRent = resp[0].length > 0 ?  resp[0][0].rent : null;
                  data.businesses = resp[1].length > 0 ?  resp[1] : null;
                  data.crime = resp[2].length > 0 ?  resp[2] : null;
                  data.environment = resp[3].length > 0 ?  resp[3] : null;
                  data.vehicle = resp[4].length > 0 ?  resp[4] : null;
                  var demo = [];
                  if (resp[5].length > 0) {
                    Object.keys(resp[5][0]).forEach(function(o) {
                      var obj = {};
                      obj.trait = o;
                      obj.val = resp[5][0][o];
                      demo.push(obj);
                    })
                  }
                  data.demo = demo;
                  // data.stations = resp[6].Items.slice(0, 5).map(function(s) {
                  //   return {
                  //     name: s.NAME.S,
                  //     line: s.LINE.S,
                  //     position: {
                  //       lat: parseFloat(s.transportation_lat.N),
                  //       lon: parseFloat(s.transportation_lon.N)
                  //     }
                  //   }
                  // });
                  data.stations = [];
                  res.json(data);
                })
                .catch(err => {
                  console.log('error: ', err);
                  res.send(500);
                })
                // connection.query(`SELECT rent
                // 	FROM rent
                // 	WHERE zip=${req.body.zip} AND bedrooms=${req.body.bed}`, function(err, results) {
                //   if (err) {
                //     console.log('error: ', err);
                //     res.send(500);
                //   } else {
                //     console.log('sucessss', results);
                //     res.json({data: results});
                //   }
                // })
              })

              router.get('/test', function(req, res, next) {
                // connection.query('select * from rent limit 10', function(err, results, fields) {
                //   if (err) {
                //     console.log('error: ', err);
                //   } else {
                //     console.log('sucessss', results);
                //   }
                // })
                // res.json([{
                //   id: 1,
                //   username: "testing"
                // }, {
                //   id: 2,
                //   username: "123"
                // }]);
              });

              module.exports = router;
