var assert = require( 'assert' )
  , Connector = require( './connector.js' )
  , cp = require( 'child_process' )
  , traverse = require( 'traverjs' );

assert( typeof Connector === 'function' );

function mule(pack, options, done) {

  assert( Array.isArray(pack) );

  return new Promise(function(resolve, reject) {

    var connector;
      
    if (typeof options === 'undefined') {
      options = {};
    }
    
    init(options, function() {
      connector = new Connector( options );
      processCommand();
    });

    function processCommand() {
      
      var command
        , args;
      assert(pack.length);
      
      command = pack[0][0];
      args = pack[0].slice(1);
      pack.splice(0,1);

      if (typeof command === "undefined") {
        resolve();
      }
      else if (pack.length) {
        connector.pipeIn()
        .then(function(context) {
          spawn( command, args, context );
          processCommand();
        })
        .catch(function(err) {
          reject(err);
        });
      }
      else if (connector.isActive()) {
        connector.pipeOut()
        .then(function(context) {
          resolve( spawn( command, args, context ) );

          assert( typeof context.stdout === 'undefined');
        })
        .catch(function(err) {
          reject(err);
        });
      }
      else {
        resolve( spawn( command, args, options ) );
      }
    }
  });

  function spawn(command, args, context) {
    var opt = {}; 
    for(var i in options) {
      if (i == 'stdio') {
        opt.stdio = [context.stdin, context.stdout, context.stderr];
      }
      else {
        opt[i] = context[i];
      }
    }
    return cp.spawn( command, args, opt ); 
  }

  function init(options, cb) {

    traverse( ['cwd', 'stdin', 'stdout', 'stderr'], (name, next) => {
      if (!options.hasOwnProperty(name)) {
        options[name] = process[name];
      }
      next();
    })
    .then( cb );
  }
}

module.exports = mule;
