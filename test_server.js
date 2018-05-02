var express = require('express'),
    app = express(),
    morgan = require('morgan');

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'));

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = '';

//console.log(process.env);

//var routes = require('./routes');
var deepPopulate = require('mongoose-deep-populate');

if(mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoSN = process.env.DATABASE_SERVICE_NAME.toUpperCase();
  
  var mongoHost = process.env[mongoSN + '_SERVICE_HOST'],
      mongoPort = process.env[mongoSN + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoSN + '_DATABASE'],
      mongoPass = process.env[mongoSN + '_PASSWORD'],
      mongoUser = process.env[mongoSN + '_USER'];
  
  if(mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    
    if(mongoUser && mongoPass) {
      mongoURL += mongoUser + ':' + mongoPass + '@';
    }
    
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
  }
}

var db = null,
    dbDetails = {};

var initDb = function(callback) { 
  
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;
  
  /*var mongoose = require('mongoose'),
      Schema = mongoose.Schema;
  
  mongoose.connect(mongoURL);
  
  var connection = mongoose.connection;
  
  connection.on('error', function() {
    console.log('error');
  });
  connection.on('open', function() {
    console.log('open');
  });*/
  
  mongodb.connect(mongoURL, function(err, conn) {
    if(err) {
      callback(err);
    }
    
    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

app.get('/', function(req, res) {
  if(!db) {
    initDb(function(err) {
      console.log(err);
    });
  }
  
  if(db) {
    //res.send('OpenShift Mongo Node');
    res.render('index.html', { pageCountMessage : null });
  }
});

app.get('/pagecount', function (req, res) {
  res.send('page count dammy');
});

initDb(function(err) {
  console.log('MongoDB problem: ' + err);
});

app.listen(port, ip);
console.log('%s: Node server started on %s:%d ...', Date(Date.now()), ip, port);

module.exports = app;