#!/usr/bin/env node 

'use strict';

let test = require( 'tape' )
  , assert = require( 'assert' )
  , Connector = require( '../connector.js' )
  , fs = require( 'fs' );

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