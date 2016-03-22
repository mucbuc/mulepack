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
  };

  this.pipeOut = function() {
    assert( typeof tempFile !== 'undefined' ); 
    return new Promise( (resolve, reject) => {
      openFileIn( tempFile )
      .then( fd => {
        resolve({ stdin: fd, stdout: options.stdout, stderr: options.stderr }); 
      } )
      .catch( reject ); 
    }); 
  };

  this.pipeIn = function() {
    return new Promise( (resolve, reject) => {
      openTempFileOut()
      .then( openFile => {
        if (typeof tempFile === 'undefined') {
          spawn( options.stdin );
        }
        else {
          openFileIn( tempFile )
          .then( fd => {
            spawn( fd );
          } )
          .catch( reject );
        }

        function spawn(stdin) {
          tempFile = openFile.path;
          resolve({ stdin: stdin, stdout: openFile.descriptor, stderr: options.stderr });
        }
      })
      .catch( reject );
    });
  };

  function openFileIn(path) {
    assert(typeof path !== 'undefined');
    return new Promise( (resolve, reject) => {
      fs.open(path, 'r', (err, fd) => {
        if (err) reject( err );
        else resolve(fd);
      });
    });
  }

  function openTempFileOut() {
    return new Promise( (resolve, reject) => {
      tmp.file( ( err, path ) => {
        if (err) reject( err );
        else {
          fs.open(path, 'a+', (err, fd) => {
            if (err) reject( err );
            else resolve( { 'descriptor': fd, 'path': path } );
          });
        }
      });
    });
  }
}

module.exports = Connector;