var assert = require( 'assert' )  
  , fs = require( 'fs' )
  , tmp = require( 'tmp' )
  , Promise = require( 'promise' );

function Connector(options) {
  var tempFile;
  
  assert(options.hasOwnProperty('stdin'));
  assert(options.hasOwnProperty('stdout'));
  assert(options.hasOwnProperty('stderr'));

  this.isActive = function() {
    return typeof tempFile !== 'undefined';
  }

  this.pipeOut = function(cb) {
    return openFileIn( tempFile )
    .then( function(fd_in) {
      cb({ stdin: fd_in, stdout: options.stdout, stderr: options.stderr }); 
    } )
    .catch( function(err) {
      throw err;
    } ); 
  }

  this.pipeIn = function(cb) {
    return openTempFileOut()
    .then( function(fd_out, path_out) {
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
    })
    .catch( function(err) {
      throw err;
    });
  }

  function openFileIn(path) {
    assert(typeof path !== 'undefined');
    return new Promise(function(resolve, reject) {
        fs.open(path, 'r', function(err, fd_in) {
          if (err) reject( err );
          else resolve(fd_in);
        });
      });
  }

  function openTempFileOut() {
    return new Promise(function(resolve, reject) {
      tmp.file( function( err, path ) {
          if (err) reject( err );
          else {
            fs.open(path, 'a+', function(err, fd) {
              if (err) reject( err );
              resolve(fd, path);
            });
          }
        });

    });
  }

}

module.exports = Connector;