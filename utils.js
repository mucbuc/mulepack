var assert = require( 'assert' )
  , cp = require( 'child_process' )
  , fs = require( 'fs' )
  , tmp = require( 'tmp' );

module.exports = {
  spawn: function(command, stdin, stdout, stderr) {
    var child = cp.spawn( 
	        command,
	        [],
	        { stdio: [stdin, stdout, stderr] } 
      );
  }, 
  
  openFileIn: function(path, cb) {
    assert(typeof path !== 'undefined');
    fs.open(path, 'r', function(err, fd_in) {
      if (err) throw err;
      cb(fd_in);
    });
  }, 

  openTempFileOut: function(cb) {
    tmp.file( function( err, path ) {
      if (err) throw err;
      fs.open(path, 'a+', function(err, fd) {
        if (err) throw err;
        cb(fd, path);
      });
    });
  }
};