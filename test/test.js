<<<<<<< HEAD
var assert = require( 'assert' )
  , Expector = require( 'expector' ).SeqExpector
  , path = require( 'path' )
  , mule = require( '../index.js' );
=======
#!/usr/bin/env node 

var assert = require( 'assert' )
  , Expector = require( 'expector' ).SeqExpector
  , path = require( 'path' )
  , mule = require( '../index.js' )
  , testImpl = require( 'tape' )
  , util = require( 'util' );
>>>>>>> f891dd37bb87afcc83e600aec0dfc83d8563f437

assert( typeof mule === 'function' );
assert( typeof Expector === 'function' );

<<<<<<< HEAD
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
=======
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
>>>>>>> f891dd37bb87afcc83e600aec0dfc83d8563f437
