#!/usr/bin/env node 

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
  expector.expect( 'object' )
    .expect( true )
    .expect( true )
    .expect( 'data' );

  mule( [['ls'], ['less']], { stdout: 'pipe' })
  .then( child => {

    expector.emit( typeof child );
    expector.emit( child.hasOwnProperty( 'stdout' ) ); 
    expector.emit( child.hasOwnProperty( 'stdin' ) ); 
    
    child.stdout.on( 'data', data => {
      expector.emit( 'data' );
    });

    child.on( 'close', () => {
      expector.check(); 
    });
    child.stdin.write( 'q' );
    process.nextTick( () => {
      child.kill(); 
    });
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
