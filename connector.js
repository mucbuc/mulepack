'use strict'; 

var assert = require( 'assert' )  
  , fs = require( 'fs' )
  , tmp = require( 'tmp' );

function Connector(options) {
  var currentPath; 

  assert(options.hasOwnProperty('stdin'));
  assert(options.hasOwnProperty('stdout'));
  assert(options.hasOwnProperty('stderr'));

  this.isActive = function() {
    return typeof currentPath !== 'undefined';
  };

  this.pipeOut = function() {
    assert( typeof currentPath !== 'undefined' ); 
    return new Promise( (resolve, reject) => {
      openReadFile( currentPath )
      .then( fd => {
        resolve({ stdin: fd, stdout: options.stdout, stderr: options.stderr }); 
      } )
      .catch( reject ); 
    }); 
  };

  this.pipeIn = function() {
    return new Promise( (resolve, reject) => {
      openWriteFile()
      .then( openFile => {
        assert( openFile.hasOwnProperty('descriptor') ); 
        
        if (typeof currentPath === 'undefined') {
          resolve({ stdin: options.stdin, stdout: openFile.descriptor, stderr: options.stderr });
        }
        else {
          openReadFile( currentPath )
          .then( fd => {
            resolve({ stdin: fd, stdout: openFile.descriptor, stderr: options.stderr });
          } )
          .catch( reject );
        }
        currentPath = openFile.path;
      })
      .catch( reject );
    });
  };

  function openFile(path, mode) {
    assert(typeof path !== 'undefined');
    return new Promise( (resolve, reject) => {
      fs.open( path, mode, (err, fd) => {
        if (err) 
          reject(err);
        else 
          resolve(fd);
      });
    });
  }

  function openReadFile(path) {
    return openFile( path, 'r' );
  }

  function openWriteFile() {
    return new Promise( (resolve, reject) => {
      tmp.file( ( err, path ) => {
        openFile( path, 'a' )
        .then( (fd) => {
          resolve( { 'descriptor': fd, 'path': path } );
        })
        .catch( reject );
      });
    });
  }
}

module.exports = Connector;