var assert = require( 'assert' )
  , Expector = require( 'expector' ).SeqExpector
  , mule = require( './index.js' );

assert( typeof mule !== 'undefined' );
assert( typeof Expector === 'function' );

suite( 'mule', function() {

	var expector;

	setup( function() {
		expector = new Expector();
	});

	teardown( function() {
		expector.check();
	});

	test( 'expector', function() {
		expector.expect( 'hey' );
		expector.emit( 'hey' );
	});

});