/**
 * queue file reader
 */
var fs = require('fs'),
path = require('path'),
queueCache = {},
queueTrack = {},
QUEUE_EXT = ".harp",
UTF8_ENCODING = 'utf8';

var _read = function(filename, callback) {
	var queueFile = filename + QUEUE_EXT;
	
	fs.exists(queueFile, function(exists) {
		if (!exists) {
			var notfound = new Error("ENOENT, '"+queueFile+"'");
			notfound.errno = 34;
			notfound.code = "ENOENT";
			notfound.path = queueFile;
			return callback(notfound);
		}
		
		fs.stat(queueFile, function(err, stats){
			if (err) {
				console.error("Cannot stat queue file %s", queueFile, err);
				return callback(err);
			}
			if ( !stats.isFile() ) {
				console.error("Cannot read queue file %s", queueFile, err);
				return callback(new Error('NOTFILE'));
			}
			var queue = queueCache[filename];
			if ( queue ) {
				return callback(null, queue);
			} else {
				console.info("Load queue file %s",queueFile);
				fs.readFile(queueFile, UTF8_ENCODING, function(err, data) {
					if (err) {
						console.error("Cannot read queue file %s", queueFile, err);
						return callback(err);
					}
					queue = data.match(/[^\r\n]+/g);
					queueCache[filename] = queue;
					return callback(null, queue);
				});
			}
		});
	});
};
exports.read = _read;

exports.next = function(filename, req, callback) {
	_read(filename, function(err, queue) {
		if (err) {
			return callback(err);
		}
		var ip = req? req.headers['X-Forwarded-For'] || req.connection.remoteAddress : '0.0.0.0',
		ident = ip,
		track = queueTrack[ident];
		
		if (!track) {
			track = queueTrack[ident] = {};
		}
		
		if (track[filename]==undefined) {
			track[filename] = -1;
		}
		
		track[filename] = (track[filename] + 1) % queue.length;
		
		contentFile = path.resolve(path.dirname(filename), queue[track[filename]]);
		
//		console.log('----queueTrack----\n', queueTrack);
//		console.log('cursor [%s][%s] : [%d]', ident, filename, track[filename]);
//		console.log('----queueCache line:', contentFile);
		
		return callback(null, contentFile);
	});
};

