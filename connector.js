var assert = require( 'assert' )  
  , fs = require( 'fs' )
  , tmp = require( 'tmp' );

function Connector(options) {
  var tempFile;
  
  assert(options.hasOwnProperty('stdin'));
  assert(options.hasOwnProperty('stdout'));
  assert(options.hasOwnProperty('stderr'));

  this.isActive = function() {
    return typeof tempFile !== 'undefined';
  }

  this.pipeOut = function(cb) {
    openFileIn( tempFile, function(fd_in) { 
      cb({ stdin: fd_in, stdout: options.stdout, stderr: options.stderr });
    });
  }

  this.pipeIn = function(cb) {
    openTempFileOut(function(fd_out, path_out) {
      if (typeof tempFile === 'undefined') {
        spawn( options.stdin );
      }
      else {
        openFileIn( tempFile, function(fd_in) {
          spawn( fd_in );
        });
      }

      function spawn(stdin) {
        tempFile = path_out;
        cb({ stdin: stdin, stdout: fd_out, stderr: options.stderr });
      }
    });
  }

  function openFileIn(path, cb) {
    assert(typeof path !== 'undefined');
    fs.open(path, 'r', function(err, fd_in) {
      if (err) throw err;
      cb(fd_in);
    });
  }

  function openTempFileOut(cb) {
    tmp.file( function( err, path ) {
      if (err) throw err;
      fs.open(path, 'a+', function(err, fd) {
        if (err) throw err;
        cb(fd, path);
      });
    });
  }

}

module.exports = Connector;