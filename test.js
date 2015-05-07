var assert = require( 'assert' )
  , Expector = require( 'expector' ).SeqExpector
  , Mule = require( './index.js' );

assert( typeof Mule !== 'undefined' );
assert( typeof Expector === 'function' );

// suite( 'mule', function() {

	var expector
	  , mule;

	//setup( function() {
		expector = new Expector();
	//});

	//teardown( function() {
		//expector.check();
	//});

	// test( 'expector', function() {
	    process.stdin.pause(); 
      	process.stdin.setRawMode( false );

		mule = new Mule(process.stdin);

		process.stdin.write( 'hello' );
// 	});

// });