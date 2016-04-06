"use strict";

let assert = require( 'assert' )
  , Connector = require( './connector.js' )
  , cp = require( 'child_process' );

assert( typeof Connector === 'function' );

function mule(pack, options) {

  assert( Array.isArray(pack) );

  return new Promise(function(resolve, reject) {
   
    if (typeof options === 'undefined') {
      options = {};
    }
    
    for(let name of ['cwd', 'stdin', 'stdout', 'stderr']) {
      if (!options.hasOwnProperty(name)) {
        options[name] = process[name];
      }
    }

    let connector = new Connector( options );
    processCommand();
    
    function processCommand() {
      
      assert(pack.length);
      
      let command = pack[0][0];
      let args = pack[0].slice(1);
      pack.splice(0,1);

      if (typeof command === "undefined") {
        resolve();
      }
      else if (pack.length) {
        connector.pipeIn()
        .then( context => {
          spawn( command, args, context );
          processCommand();
        })
        .catch(reject);
      }
      else if (connector.isActive()) {
        connector.pipeOut()
        .then( context => {
          resolve( spawn( command, args, context ) );
          assert( typeof context.stdout === 'undefined');
        })
        .catch(reject);
      }
      else {
        resolve( spawn( command, args, options ) );
      }
    }
  });

  function spawn(command, args, context) {
    let opt = {}; 
    for(let i in options) {
      if (i == 'stdio') {
        opt.stdio = [context.stdin, context.stdout, context.stderr];
      }
      else {
        opt[i] = context[i];
      }
    }
    return cp.spawn( command, args, opt ); 
  }
}

module.exports = mule;
