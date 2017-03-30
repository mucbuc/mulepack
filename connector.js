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

  function openReadFile(path) {
    return new Promise( (resolve, reject) => {
      /*
      //this should work 
      let stream = fs.createReadStream( path );
      stream.on( 'open', resolve ); 
      stream.on( 'error', reject );

      // but it acts as if the file is closed  
      fs.open( path, 'r', (err, fd) => {
        if (err) 
        {
          reject(err);
        }
        else {
          fs.closeSync(fd);
          resolve(fd);
        }
      });

      // instead just use open :(
      */ 

      fs.open( path, 'r', (err, fd) => {
        if (err) 
        {
          reject(err);
        }
        else {
          resolve(fd);
        }
      });
    });
  }

  function openWriteFile() {
    return new Promise( (resolve, reject) => {
      tmp.file( ( err, path ) => {
        if (err) {
          reject( err );
          return;
        }
        let stream = fs.createWriteStream( path );
        stream.on( 'open', (fd) => {
          
          console.log( 'write stream opened' );
        
          resolve( { descriptor: fd, path } );
        });
        stream.on( 'error', (err) => {
          reject( err );
        });
      });
    });
  }
}

module.exports = Connector;