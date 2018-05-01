var express = require('express'),
    app = express();

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = '';

console.log(process.env);

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

var mongo = require('mongodb'), 
    mongoose = require('mongoose'), 
    Scheme = mongoose.Schema;

mongoose.connect(mongoURL);

var db = mongoose.connection;

db.on('error', function() {
  
  console.log('error');
  
});

db.on('open', function() {
  
  console.log('open');
  
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

app.get('/', function(req, res) {
  res.send('OpenShift Mongo Node');
});

app.listen(port, ip);
console.log('%s: Node server started on %s:%d ...', Date(Date.now()), ip, port);

module.exports = app;