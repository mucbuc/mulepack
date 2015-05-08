/*
events: 
  child_error, error_read, read, write, exit, close
*/ 

var assert = require( 'assert' )
  , cp = require( 'child_process' )
  , fs = require( 'fs' )
  , stream = require( 'stream' )
  , tmp = require( 'tmp' );

function Mule(pack, stdin, stdout, stderr) {
  
  assert( Array.isArray(pack) );
  assert( pack.length > 0 );

  var stash;

  process.stdin.pause(); 
  process.stdin.setRawMode( false );
  processNextCommand();

  function processNextCommand() {
    assert(pack.length);
    var command = pack[0];
    pack.splice(0,1);

    if (pack.length) {
      openTempFile(function(fd_out, path_out) {
        if (typeof stash === 'undefined') {
          stash = path_out;
          spawn(command, stdin, fd_out, stderr );
          processNextCommand();
        }
        else {
          openStash( function(fd_in) {
            stash = path_out;
            spawn(command, fd_in, fd_out, stderr );
            processNextCommand();
          });
        }
      });
    }
    else if (typeof stash !== 'undefined') {
      openStash( function(fd_in) { 
        spawn(command, fd_in, stdout, stderr );
      });
    }
    else {
      spawn(command, stdin, stdout, stderr );
    }
  }

  function spawn(command, stdin, stdout, stderr) {
    var child = cp.spawn( 
        command, 
        { stdio: [stdin, stdout, stderr] } 
      );
  }

  function openStash(cb) {
    assert(typeof stash !== 'undefined');
    fs.open(stash, 'r', function(err, fd_in) {
      if (err) throw err;
      cb(fd_in);
    });
  }

  function openTempFile(cb) {
    tmp.file( function( err, path ) {
      if (err) throw err;
      fs.open(path, 'a+', function(err, fd) {
        if (err) throw err;
        cb(fd, path);
      });
    });
  }
}

module.exports = Mule;


    // && result.hasOwnProperty('stdin')

    // openReadStreams(context.stdin, function(fd) {
    //   result.stdin = fd;
    //   checkIfDone();
    // });

    // function openReadStreams(path, cb) {
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