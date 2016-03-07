#!/usr/bin/env node 

var assert = require( 'assert' )
  , Expector = require( 'expector' ).SeqExpector
  , path = require( 'path' )
  , mule = require( '../index.js' )
  , test = require( 'tape' )
  , util = require( 'util' );

assert( typeof mule === 'function' );
assert( typeof Expector === 'function' );

test( 'stdout option with single pipe', function(t) {
  
  var expector = new Expector(t);
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

test( 'less with path argument', function(t) {

  var expector = new Expector(t);
  
  expector.expect( 'object' );
  expector.expect( true );
  expector.expect( 'data', 'hello' );

  mule( [['less', 'sample/test.txt']], { stdout: 'pipe' })
  .then( function(child) {
    
    expector.emit( typeof child );
    expector.emit( child.hasOwnProperty( 'stdout' ) ); 
    
    child.stdout.on( 'data', function(data) {
      expector.emit( 'data', data.toString() );
    });

    child.on( 'close', function() {
      expector.check(); 
    });
  } );
});

test( 'stdout option with multiple pipe', function(t) {
  
  var expector = new Expector(t);
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

test( 'cwd option', function(t) {

  var expector = new Expector(t);

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

test( 'check stderr', function(t) {
  
  var expector = new Expector(t);
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

test( 'check stdout', function(t) {

  var expector = new Expector(t);
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

test( 'check stdin', function(t) {
  
  var expector = new Expector(t);
  
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
