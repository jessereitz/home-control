#! /usr/bin/env node

const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

function buildPackage() {
  console.log('Cleaning package.json and copying it to ../dist');
  let packageConf;
  try {
    packageConf = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
    packageConf.bin = './server.js';
    packageConf.main = './server.js';
    packageConf.name = 'home-control';
    packageConf.devDependencies = null;
    fs.writeFileSync(path.join(__dirname, '..', 'dist', 'package.json'), JSON.stringify(packageConf, null, 2), (err) => {
      if (err) {
        console.error(chalk.bold.red('ERROR: File write error.'), err.message);
        process.exit(1);
      }
      console.log('New package.json created successfully in dist directory.');
      process.exit(0);
    });
  } catch (e) {
    console.error(chalk.bold.red('ERORR: No package.json.'), e.message);
    process.exit(1);
  }
}

buildPackage();
