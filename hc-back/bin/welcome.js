#! /usr/bin/env node

/* *****************
 *     Welcome     *
 **************** */

/**
* This script welcomes a new Home Control user.
*
*/

const chalk = require('chalk');

const info = chalk.bgCyan;


function main() {
  console.log(info('\n\nWelcome to Home Control!\n\n'));
  console.log("Let's get things set up for you.");
}

main();
