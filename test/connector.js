#!/usr/bin/env node 

'use strict';

let test = require( 'tape' )
  , assert = require( 'assert' )
  , Connector = require( '../connector.js' )
  , fs = require( 'fs' );

test( 'connector pipeOut', (t) => {
  var c = new Connector( { stdout: '', stdin: '', stderr: '' })
    , buffer = new Buffer("hello");

  c
  .pipeIn()
  .then( result => {
    fs.write( result.stdout, buffer.toString(), (err) => {
      if (err) throw err;
      c
      .pipeOut()
      .then( result => {
        let tmp = new Buffer(buffer.length);
        fs.read( result.stdin, tmp, 0, tmp.length, 0, (err, bytesRead, bufferRead) => {
          if (err) throw err;
          t.assert( bufferRead.toString().trim() === buffer.toString().trim() );
          t.end(); 
        });
      });
    } ); 
    
  });

});

test( 'connector pipeIn', (t) => {
  var c = new Connector( { stdout: '', stdin: '', stderr: '' }); 
  c
  .pipeIn()
  .then( ( result ) => {
    
    t.assert( result.hasOwnProperty( 'stdout' ) );
    t.assert( c.isActive() );
    fs.write( result.stdout, "hello", (err) => {
      t.assert(!err);
      t.end(); 
    } ); 
  })
  .catch( () => {
    t.fail();
    t.end();
  });
});