var assert = require( 'assert' )
  , Expector = require( 'expector' ).SeqExpector
  , path = require( 'path' )
  , mule = require( '../index.js' );

assert( typeof mule === 'function' );
assert( typeof Expector === 'function' );

suite( 'mule', function() {

  var expector;

  setup(function() {
    expector = new Expector();
  });

  teardown(function() {
    process.nextTick( expector.check );
  });

  test( 'stdout option with single pipe', function() {
    mule( [['ls']], { stdout: 'pipe' })
    .then( function(child) {
      assert( typeof child !== 'undefined' );
      assert( child.hasOwnProperty( 'stdout' ) ); 
    });
  });

  test( 'stdout option with multiple pipe', function() {
    mule( [['ls'], ['less']], { stdout: 'pipe' })
    .then( function(child) {
      assert( typeof child !== 'undefined' );
      assert( child.hasOwnProperty( 'stdout' ) ); 
    } );
  });

  test( 'cwd option', function(done) {
    var options = { 
          cwd: path.join( __dirname, 'sample' ),
          stdout: 'pipe'
    };

    mule( [['ls']], options )
    .then(function(child) {
      var result = '';
      child.stdout.on( 'data', function(data) {
        result += data.toString();
      });

      child.on('close', function() {
        assert( /test\.txt/.test( result ) );
        done();
      });
    } );
  });

  test( 'check stderr', function(done) {
    expector.expectNot( 'stdout' );
    expector.expect( 'stderr' );
    
    mule( 
      [['cat', 'doesNotExist.txt']], 
      {
        controller: expector,
        stdout: 'pipe',
        stdin: 'pipe',
        stderr: 'pipe'
      })
    .then( function(child) {
      
        child.stderr.on( 'data', function(data) {
          expector.emit( 'stderr' );
        });

        child.stdout.on( 'data', function(data) {
          expector.emit( 'stdout' );
        });

        child.on( 'close', function() {
          process.nextTick( done );
        });
      });
  });

  test( 'check stdout', function(done) {

    expector.expectNot( 'stderr' );
    expector.expect( 'stdout' );

    mule( 
      [['ls']], 
      {
        controller: expector,
        stdout: 'pipe',
        stdin: 'pipe',
        stderr: 'pipe'
      })
    .then( function(child) {
      child.stderr.on( 'data', function(data) {
        expector.emit( 'stderr' );
      });

      child.stdout.on( 'data', function(data) {
        expector.emit( 'stdout' );
      });

      child.on( 'close', function() {
        process.nextTick( done );
      });
    });
  });

  test( 'check stdin', function(done) {
    var options = {
          controller: expector,
          stdout: 'pipe',
          stdin: 'pipe',
          env: process.env
        };
    options.env.PATH += ':' + path.join( __dirname, 'bin' );

    mule( 
      [['dummy_read']],
      options )
    .then( function(child) {
        child.stdin.write('a\n');
        child.on( 'close', function() {
          process.nextTick( done );
        });
    });
  });

});