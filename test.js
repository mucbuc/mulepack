#!/usr/bin/env node

var assert = require( 'assert' )
  , Expector = require( 'expector' ).SeqExpector
  , Mule = require( './index.js' );

assert( typeof Mule !== 'undefined' );
assert( typeof Expector === 'function' );

// suite( 'mule', function() {

	var mule;
	    // process.stdin.pause(); 
     //  	process.stdin.setRawMode( false );

		mule = new Mule(
			['ls', 'less'], 
			process.stdin, 
			process.stdout, 
			process.stderr ); 
