
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , content = require('./routes/content')
  , http = require('http')
  , path = require('path')
  , config = require('./config')
  , DEFAULT_PORT = 8880;

var _version = require("./package").version,
argv = require('optimist')
    .usage('Harp HTTP Server (' + _version + ').\nUsage: $0 [options]')
    .alias('v', 'version')
    .describe('v', 'Print version information')
    .alias('p', 'port')
    .describe('p', 'Server listening port')
    .check(function(argv) {
    	if (argv.port && !(/^[0-9]{1,5}$/.test(argv.port) && argv.port < 65536)) {
    		throw 'Invalid port number specified';
    	}
    })
    .argv;

if (argv.version) {
	console.info(_version);
	process.exit();
}

var app = express();

// all environments
app.set('port', argv.port || config.Port || DEFAULT_PORT);
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'jade');
app.use(express.favicon(path.join(__dirname, '/public/i/favicon.ico')));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var adminPath = path.join("/", config.Admin, "/*"),
adminBasePath = path.dirname(adminPath);

app.get(adminBasePath, routes.index);
app.get(adminPath, routes.index);
app.get('/*', content.show);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Harp HTTP Server (' + _version + ') listening on port ' + app.get('port'));
  console.log('Admin URL http://localhost:' + app.get('port')  + adminBasePath);
});
