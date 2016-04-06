#!/usr/bin/env node 

'use strict';

let test = require( 'tape' )
  , assert = require( 'assert' )
  , Connector = require( '../connector.js' );

test( 'connector isActive', (t) => {
	var c = new Connector( { stdout: '', stdin: '', stderr: '' }); 
	c
	.pipeIn()
	.then( () => {
		t.assert( c.isActive() );
		t.end(); 
	})
	.catch( () => {
		t.fail();
		t.end();
	});
});