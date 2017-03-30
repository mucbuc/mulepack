#!/usr/bin/env node 

'use strict';

var assert = require( 'assert' )
  , Expector = require( 'expector' ).SeqExpector
  , path = require( 'path' )
  , mule = require( '../index.js' )
  , test = require( 'tape' );

assert( typeof mule === 'function' );
assert( typeof Expector === 'function' );

test( 'color output', t => {

  var expector = new Expector(t);
  expector.expect( 'data', '\x1b[31mhello\x1b[39;49m' ); 

  mule( 
    [['node', path.join(__dirname, 'color.js' ) ]],
    { stdout: 'pipe' }
  )
  .then( child => {

    assert( child.hasOwnProperty( 'stdout' ) ); 

    child.stdout.on( 'data', data => {
      expector.emit( 'data', data.toString() ); 
      expector.check();
    });
  })
  .catch( error => {
    console.log( error );
  });
});

test( 'less with path argument', t => {

  var expector = new Expector(t);
  
  expector.expect( 'data', 'hello' );

  mule( [['less', path.join(__dirname, 'sample/test.txt')]], { stdout: 'pipe' })
  .then( child => {
    
    assert( typeof child === 'object' );
    assert( child.hasOwnProperty( 'stdout' ) ); 
    
    child.stdout.on( 'data', data => {
      expector.emit( 'data', data.toString() );
      expector.check(); 
    });
  });
});

test( 'stdout option with multiple pipe', t => {
  
  var expector = new Expector(t);
  expector.expect( 'data' );

  mule( [['ls'], ['less']], { stdout: 'pipe' })
  .then( child => {

    assert( typeof child === 'object' );
    assert( child.hasOwnProperty( 'stdout' ) ); 
    assert( child.hasOwnProperty( 'stdin' ) ); 
    
    child.stdout.on( 'data', data => {
      
      console.log( 'got data' ); 

      expector.emit( 'data' ).check(); 
    });

    child.stdin.write( 'q' );
   
    // TODO: fix this, it sucks
    setTimeout( () => {
      child.kill(); 
    }, 100 );
  });
});

test( 'cwd option', t => {

  var expector = new Expector(t);

  var options = { 
        cwd: path.join( __dirname, 'sample' ),
        stdout: 'pipe'
  };

  expector.expect( 'test.txt\n' ); 

  mule( [['ls']], options )
  .then( child => {
    var result = '';
    child.stdout.on( 'data', data => {
      result += data.toString();
    });

    child.on('close', () => {
      expector.emit( result );
      expector.check(); 
    });
  } );
});

test( 'check stderr', t => {
  
  var expector = new Expector(t);
  expector
    .expectNot( 'stdout' )
    .expect( 'stderr' );
  
  mule( 
    [['cat', 'doesNotExist.txt']], 
    makeOptions(expector))
  .then( child => {
    
      child.stderr.once( 'data', data => {
        expector.emit( 'stderr' );
      });

      child.stdout.on( 'data', data => {
        expector.emit( 'stdout' );
      });

      child.on( 'close', () => {
        expector.check();
      });
    });
});

test( 'check stdout', t => {

  var expector = new Expector(t);
  expector.expectNot( 'stderr' )
    .expect( 'stdout' );

  mule( 
    [['ls']], 
    makeOptions(expector)
  )
  .then( child => {
    child.stderr.on( 'data', data => {
      expector.emit( 'stderr' );
    });

    child.stdout.on( 'data', data => {
      expector.emit( 'stdout' );
    });

    child.on( 'close', () => {
      expector.check(); 
    });
  });
});

test( 'check stdin', t => {
  
  let expector = new Expector(t)
    , options = {
        controller: expector,
        stdout: 'pipe',
        stdin: 'pipe',
        env: process.env
      };
  options.env.PATH += ':' + path.join( __dirname, 'bin' );

  expector.expectNot( 'data' ); 

  mule( 
    [['read', '-s', '-n1']],
    options )
  .then( child => {
      
      child.stdout.on( 'data', data => {
        expector.emit( 'data' ); 
      });
      child.stdin.write('a\n');
      child.on( 'close', () => {
        expector.check();
      });
  });
});

function makeOptions(expector) {
  return {
    controller: expector,
    stdout: 'pipe',
    stdin: 'pipe',
    stderr: 'pipe'
  };
}
