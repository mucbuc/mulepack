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
  .then( createChild => {
    let child = createChild();
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
  .then( createChild => {
    let child = createChild();
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
  expector.expect( 'q' );

  mule( [['ls'], ['less']], { stdout: 'pipe' })
  .then( createChild => {
    let child = createChild();
    assert( typeof child === 'object' );
    assert( child.hasOwnProperty( 'stdout' ) ); 
    assert( child.hasOwnProperty( 'stdin' ) ); 
    
    child.stdout.on( 'data', data => {
      expector.emit( data.toString() ).check(); 
    });

    child.stdin.write( 'q' );
    child.stdin.end();
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
  .then( createChild => {
    let child = createChild();
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
  .then( createChild => {
      let child = createChild();
    
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
  .then( createChild => {
    let child = createChild();
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
        stdin: 'pipe'
      };

  expector.expect( 'q\n' ); 

  mule( 
    [['echo' ], ['less']],
    options )
  .then( createChild => {
      let child = createChild();
      
      child.stdout.on( 'data', data => {
        expector.emit(data.toString());
      });

      child.stderr.on( 'data', data => {
        expector.emit( 'error' ); 
      });

      child.on( 'close', () => {
        expector.check();
      });

      child.stdin.write('q\n');
    child.stdin.end();
  });
});

test( 'should fail without throwing exception', t => {
  let e = new Expector(t)
    , options = { 
        controller: e,
        stdout: 'ignore',
        stdin: 'pipe'
    };

  e.expectNot('fail');

  mule( 
    [['uytyuyt' ]],
    options )
  .then( (createChild) => {
    console.log( 'eere' );
    
    let child = createChild();
    child.on( 'close', () => { 
      e.check();
    });
  })
  .catch( () => {
    e.expect( 'fail' );
    e.check();
  });
})

function makeOptions(expector) {
  return {
    controller: expector,
    stdout: 'pipe',
    stdin: 'pipe',
    stderr: 'pipe'
  };
}
