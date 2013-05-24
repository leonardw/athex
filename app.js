
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , config = require('./config');

var app = express();

// all environments
app.set('port', process.env.PORT || config.Port || 8880);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var adminPath = path.join("/", config.Admin, "/*");
var adminBasePath = path.dirname(adminPath);
app.get(adminBasePath, routes.index);
app.get(adminPath, routes.index);
app.get('/*', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
  console.log('Admin URL http://localhost:' + app.get('port')  + adminBasePath);
});
