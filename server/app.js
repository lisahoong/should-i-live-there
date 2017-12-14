var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var hbs = require('express-handlebars');
var Strategy = require('passport-facebook').Strategy;
var gps = require('gps2zip');
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


var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars',
hbs({defaultLayout: 'Main'})); app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

passport.use(new Strategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: 'http://localhost:3000/auth/facebook/callback'
},
function(accessToken, refreshToken, profile, cb) {
  console.log('PROFILE: ', profile);
  req.user = profile;
  // In this example, the user's Facebook profile is supplied as the user
  // record.  In a production-quality application, the Facebook profile should
  // be associated with a user record in the application's database, which
  // allows for account linking and authentication with other identity
  // providers.
  return cb(null, profile);
}));

passport.serializeUser(function(user, cb) {
  console.log('jbdfjdnjfsd');
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res, next) {
  res.send(200);
});

// app.get('/login/facebook', function(req, res) {
//   console.log('i here');
//   res.send(200);
// })

app.get('/login/facebook',
  passport.authenticate('facebook')
);

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect : '/home',
        failureRedirect : '/'
    }));

app.post('/check', function(req, res) {
  console.log('user', req.user);

  var a = new Promise(function(resolve, reject) {
    connection.query(`SELECT rent
      FROM rent
      WHERE zip=${req.body.zip} AND bedrooms=${req.body.bed}`, function(err, results) {
        if (err) {
          console.log('error: ', err);
          return reject(err);
        } else {
          return resolve({name: 'avgRent', results: results});
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
            return resolve({name: 'businesses', results: results});
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
              return resolve({name: 'crime', results: results});
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
                return resolve({name: 'environment', results: results});
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
                  return resolve({name: 'vehicle', results: results});
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
                    return resolve({name: "demo", results: results});
                  }
                })
              })


              var g = new Promise(function(resolve, reject) {
                nosql.scan({TableName: 'subway'}, function(err, data) {
                  if (err) {
                    return reject(err);
                  } else {
                    return resolve({name: 'stations', results: data.Items});
                  }
                })
              });


              Promise.all([a, b, c, d, e, f, g]).then(function(resp) {
                var data = {};
                resp.forEach(function(x) {
                  data[x.name] = x.results
                })

                data.avgRent = data.avgRent[0].rent || null;
                data.businesses = data.businesses || null;
                data.crime = data.crime || null;
                data.environment = data.environment || null;
                data.vehicle = data.vehicle || null;
                data.demo = data.demo || null;
                var demo = [];
                if (data.demo) {
                  Object.keys(data.demo[0]).forEach(function(o) {
                    var obj = {};
                    obj.trait = o;
                    obj.val = data.demo[0][o];
                    demo.push(obj);
                  })
                }
                data.demo = demo;
                var stationZip = [];
                data.stations.forEach(function(s) {
                  //console.log(typeof gps.gps2zip(parseFloat(s.transportation_lat.N), parseFloat(s.transportation_lon.N)).zip_code);
                  if (gps.gps2zip(parseFloat(s.transportation_lat.N), parseFloat(s.transportation_lon.N)).zip_code === parseFloat(req.body.zip)) {
                    stationZip.push({
                      name: s.NAME.S,
                      line: s.LINE.S,
                      position: {
                        lat: parseFloat(s.transportation_lat.N),
                        lng: parseFloat(s.transportation_lon.N)
                      }
                    });
                  }
                })
                //console.log(stationZip);
                data.stations = stationZip;
                // data.stations = data.stations.slice(0, 5).map(function(s) {
                //
                  // return {
                  //   name: s.NAME.S,
                  //   line: s.LINE.S,
                  //   position: {
                  //     lat: parseFloat(s.transportation_lat.N),
                  //     lon: parseFloat(s.transportation_lon.N)
                  //   }
                  // }
                // });
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


            app.get('/*', function(req, res) {
              res.send(200);
            })

            // catch 404 and forward to error handler
            app.use(function(req, res, next) {
              var err = new Error('Not Found');
              err.status = 404;
              next(err);
            });

            // error handler
            app.use(function(err, req, res, next) {
              // set locals, only providing error in development
              res.locals.message = err.message;
              res.locals.error = req.app.get('env') === 'development' ? err : {};

              // render the error page
              res.status(err.status || 500);
              res.render('error');
            });

            module.exports = app;
