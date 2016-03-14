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

  this.pipeOut = function() {
    return new Promise(function(resolve, reject) {
      openFileIn( tempFile )
      .then( function(fd_in) {
        resolve({ stdin: fd_in, stdout: options.stdout, stderr: options.stderr }); 
      } )
      .catch( function(err) {
        reject( err );
      } ); 
    }); 
  }

  this.pipeIn = function() {
    return new Promise(function(resolve, reject) {
      openTempFileOut()
      .then( function(openFile) {
        if (typeof tempFile === 'undefined') {
          spawn( options.stdin );
        }
        else {
          openFileIn( tempFile, function(fd_in) {
            spawn( fd_in );
          });
        }

        function spawn(stdin) {
          tempFile = openFile.path;
          resolve({ stdin: stdin, stdout: openFile.descriptor, stderr: options.stderr });
        }
      })
      .catch( function(err) {
        reject(err);
      });
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
              resolve( { 'descriptor': fd, 'path': path } );
            });
          }
        });

    });
  }

}

module.exports = Connector;