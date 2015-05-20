var assert = require( 'assert' )
  , Connector = require( './connector.js' )
  , cp = require( 'child_process' )
  , Promise = require( 'promise' );

assert( typeof Connector === 'function' );

function mule(pack, options, done) {

  return new Promise(function(resolve, reject) {

    var connector;
    assert( Array.isArray(pack) );
    
    if (typeof options === 'undefined') {
      options = {};
    }
    
    init(options, function() {
      connector = new Connector( options );
      processCommand();
    });

    function processCommand() {
      
      var command;
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
        opt[i] = options[i];
      }
    }
    
    return cp.spawn( command, args, opt );
  }

  function init(options, cb) {

    if (!options.hasOwnProperty('cwd')) {
      options.cwd = process.cwd();
    }

    ['stdin', 'stdout', 'stderr']
    .forEach(function(name, index, names) {
      if (!options.hasOwnProperty(name)) {
        options[name] = process[name];
      }
      if (index == names.length - 1) {
        cb();
      }
    });
  }
}

module.exports = mule;