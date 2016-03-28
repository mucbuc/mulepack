'use strict'; 

var assert = require( 'assert' )  
  , fs = require( 'fs' )
  , tmp = require( 'tmp' );

function Connector(options) {
  var currentFilePath;
  
  assert(options.hasOwnProperty('stdin'));
  assert(options.hasOwnProperty('stdout'));
  assert(options.hasOwnProperty('stderr'));

  this.isActive = function() {
    return typeof currentFilePath !== 'undefined';
  };

  this.pipeOut = function() {
    assert( typeof currentFilePath !== 'undefined' ); 
    return new Promise( (resolve, reject) => {
      openFileIn( currentFilePath )
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
        if (typeof currentFilePath === 'undefined') {
          resolve({ stdin: options.stdin, stdout: openFile.descriptor, stderr: options.stderr });
        }
        else {
          openFileIn( currentFilePath )
          .then( fd => {
            resolve({ stdin: fd, stdout: openFile.descriptor, stderr: options.stderr });
          } )
          .catch( reject );
        }
        currentFilePath = openFile.path;
      })
      .catch( reject );
    });
  };

  function openFileIn(path) {
    assert(typeof path !== 'undefined');
    return new Promise( (resolve, reject) => {
      let stream = fs.createReadStream( path );
      stream.on( 'open', (fd) => {
        resolve(fd);
      });
      stream.on( 'error', (err) => {
        reject( err ); 
      });
    });
  }

  function openTempFileOut() {
    return new Promise( (resolve, reject) => {
      tmp.file( ( err, path ) => {
        if (err) reject( err );
        else {
          let stream = fs.createWriteStream( path );
          stream.on( 'open', (fd) => {
            resolve( { 'descriptor': fd, 'path': path } );
          });
          stream.on( 'error', (err) => {
            reject( err ); 
          });
        }
      });
    });
  }
}

module.exports = Connector;