#!/usr/bin/env node

'use strict';

/*
let ansi = require( 'ansi' )
  , cursor = ansi(process.stdout);

cursor
	.red()
	.write('hello')
	.reset();

	*/ 

	console.log( '\x1b[31mhello\x1b[39;49m' ); 