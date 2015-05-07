/*
events: 
  child_error, error_read, read, write, exit, close
*/ 

var assert = require( 'assert' )
  , cp = require( 'child_process' )
  , fs = require( 'fs' )
  , stream = require( 'stream' )
  , tmp = require( 'tmp' );

function Mule(inStream) {
  
  assert( typeof inStream !== 'undefined' );

  openIO(function(context) {
    assert(context.hasOwnProperty('stderr'));
    assert(context.hasOwnProperty('stdout'));
    console.log( 'context.stdout', context.stdout );
    var o = fs.createWriteStream(context.stdout.path);
    o.on( 'open', function() {
      inStream.pipe(o);
    });
  });

  function openIO(cb) {
    var result = {};

    ['stderr', 'stdout']
    .forEach(function(e) {
      openOut(function(fd, path) {
        result[e] = { fd: fd, path: path }; 
        checkIfDone();
      });
    });

    function checkIfDone() {
      if (    result.hasOwnProperty('stderr')
          &&  result.hasOwnProperty('stdout')) {
        cb(result);
      };
    }
    
    function openOut(cb) {
      tmp.file( function( err, path ) {
        console.log( path );
        if (err) throw err;
        fs.open(path, 'a+', function(err, fd) {
          if (err) throw err;
          cb(fd, path);
        });
      });
    }
  }
};

module.exports = Mule;


    // && result.hasOwnProperty('stdin')

    // openIn(context.stdin, function(fd) {
    //   result.stdin = fd;
    //   checkIfDone();
    // });

    // function openIn(path, cb) {
    //   assert( typeof path !== 'undefined' );
    //   fs.open(path, 'r', function(err, fd) {
    //     if (err) throw err;
    //     cb(fd);
    //   });
    // }

/*
          var child = cp.spawn( 
            args.cmd, 
            args.args, 
            { 
              cwd: args.cwd, 
              stdio: [ 'pipe', 'pipe', 'pipe' ] 
            });
          
          // error event
          child.on( 'error', function(data) {
            emitter.emit( 'child_error', data );
          } );

          // error stream
          child.stderr.on( 'data', function( data ) {
            emitter.emit( 'stderr', data );
          } );

          // output
          child.stdout.on( 'data', function( data ) {
            emitter.emit( 'stdout', data );
          } );

          // input
          emitter.on( 'stdin', onWrite );

          // exit
          child.on( 'exit', function(code, signal) { 
            emitter.emit( 'exit', code, signal );
          } );

          // close
          child.on( 'close', function(code, signal) { 
            emitter.removeListener( 'stdin', onWrite );
            emitter.removeListener( 'kill', onKill );
            emitter.emit( 'close', code, signal );
          } );

          // kill
          emitter.on( 'kill', onKill );

          function onKill() {
            child.kill();
          }

          function onWrite( data ) {
            child.stdin.write( data );
          }


exports.Processor = Processor;
*/ 