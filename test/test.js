#!/usr/bin/env node 

var assert = require( 'assert' )
  , Expector = require( 'expector' ).SeqExpector
  , path = require( 'path' )
  , mule = require( '../index.js' )
  , testImpl = require( 'tape' )
  , util = require( 'util' );

assert( typeof mule === 'function' );
assert( typeof Expector === 'function' );

function test(name, cb) {
  testImpl(name, function(t) {
    var expector = new Expector(t);
    cb(expector);
  }); 
}

test( 'stdout option with single pipe', function(expector) {
  
  expector.expect( 'object' );
  expector.expect( 'data' );
  
  mule( [['ls']], { stdout: 'pipe' })
  .then( function(child) {
    
    expector.emit( typeof child );
    assert( child.hasOwnProperty( 'stdout' ) );
    child.stdout.on( 'data', function(data) {
      expector.emit( 'data' );
    });
    
    child.on( 'close', function() {
      expector.check(); 
    });
  });
});

/*
test( 'stdout option with multiple pipe', function(expector) {
  
  expector.expect( 'object' );
  expector.expect( true );
  expector.expect( 'data' );

  mule( [['ls'], ['less']], { stdout: 'pipe' })
  .then( function(child) {
    
    expector.emit( typeof child );
    expector.emit( child.hasOwnProperty( 'stdout' ) ); 
    
    child.stdout.on( 'data', function(data) {
      
      expector.emit( 'data' );
    });

    child.on( 'close', function() {
      expector.check(); 
    });
  } );
});
*/

test( 'cwd option', function(expector) {
  var options = { 
        cwd: path.join( __dirname, 'sample' ),
        stdout: 'pipe'
  };

  expector.expect( 'test.txt\n' ); 

  mule( [['ls']], options )
  .then(function(child) {
    var result = '';
    child.stdout.on( 'data', function(data) {
      result += data.toString();
    });

    child.on('close', function() {
      expector.emit( result );
      expector.check(); 
    });
  } );
});

test( 'check stderr', function(expector) {
  
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
        expector.check();
      });
    });
});

test( 'check stdout', function(expector) {

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
      expector.check(); 
    });
  });
});

test( 'check stdin', function(expector) {
  var options = {
        controller: expector,
        stdout: 'pipe',
        stdin: 'pipe',
        env: process.env
      };
  options.env.PATH += ':' + path.join( __dirname, 'bin' );

  expector.expectNot( 'data' ); 

  mule( 
    [['dummy_read']],
    options )
  .then( function(child) {
      
      child.stdout.on( 'data', function(data) {
        expector.emit( 'data' ); 
      });

      child.stdin.write('a\n');
      child.on( 'close', function() {
        expector.check();
      });
  });
});
