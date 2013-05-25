/**
 * Utility
 */

/*
process.argv.forEach(function(val, index, array) {
	console.log(index + ': ' + val);
});
*/

var cli = {};
(function(){
	var args = process.argv;
	if (args.length > 2) {
		var p2 = args[2];
		if ( /^[0-9]+$/.test(p2) ) {
			cli.port = parseInt(p2);
		}
	}
})();

exports.cli = cli;