#! /usr/bin/env node

/* *********************
 *     Create User     *
 ******************** */

/**
* This script creates a new Home Control user.
*
* Note: This only creates a user in the main database, not on the client
*   machines. This user will be able to view the status of the servers but
*   will NOT be able to restart or shut them down.
*/
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const prompts = require('prompts');

const error = chalk.bold.red;
const success = chalk.bold.green;
const info = chalk.bgCyan;

const configFilePath = path.join(__dirname, '..', 'server-config.json');

const yesVals = ['y', 'ye', 'yes', 'yeah', 'yep', 'yup', 'yay'];
const noVals = ['n', 'no', 'nah', 'hope', 'nay'];

function isYes(rawVal) {
  const val = String(rawVal).toLowerCase();
  return yesVals.includes(val);
}

function isNo(rawVal) {
  const val = String(rawVal).toLowerCase();
  return noVals.includes(val);
}

function isYesNo(rawVal) {
  return isYes(rawVal) || isNo(rawVal);
}

function yesNoQuestion(msg) {
  return {
    type: 'text',
    name: 'yesNo',
    initial: 'Y',
    message: msg,
    validate: createConfig => (isYesNo(createConfig) ? true : 'Invalid response. Please enter yes or no.'),
  };
}

function isIP(rawIP) {
  const ipFormat = /^[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}$/;
  return rawIP.match(ipFormat);
}

function isMAC(rawMAC) {
  const macFormat = /^[0-9a-zA-Z]{2}:[0-9a-zA-Z]{2}:[0-9a-zA-Z]{2}:[0-9a-zA-Z]{2}:[0-9a-zA-Z]{2}:[0-9a-zA-Z]{2}$/;
  return rawMAC.match(macFormat);
}

const serverQuestions = [
  {
    type: 'text',
    name: 'name',
    message: 'What is the name of your server?',
  },
  {
    type: 'text',
    name: 'ip',
    message: 'What is your server\'s IP address?',
    validate: val => (isIP(val) ? true : 'Invalid format. Use format XXX.XXX.XXX.XXX'),
  },
  {
    type: 'text',
    name: 'mac',
    message: 'What is your server\'s MAC address?',
    validate: val => (isMAC(val) ? true : 'Invalid format. Use format XX:XX:XX:XX:XX:XX'),
  },
];

async function askServerQuestions(serverList) {
  let innerServerList = [];
  if (serverList) innerServerList = serverList;
  const serverInfo = await prompts(
    serverQuestions,
    { onCancel: () => false },
  );
  if (Object.keys(serverInfo).length !== serverQuestions.length) return null;
  innerServerList.push(serverInfo);
  console.log('Alright, that server\'s all set.');
  const addAnother = await prompts(yesNoQuestion(
    '\nWould you like to add another server?',
    { onCancel: () => false },
  ));
  if (isNo(addAnother.yesNo)) return innerServerList;
  return askServerQuestions(innerServerList);
}

function cancelCreation() {
  console.log(
    '\nAlright. We won\'t add a server right now.',
    'If you would like to add a server in the future, just run create-config.js again or edit the server-config.json file.\n',
  );
  return 1;
}

async function createConfigResponse() {
  console.log(info('\n\nAdd Servers to Home Control\n\n'));
  console.log(
    'This program will walk you through adding servers to Home Control.',
    'You will need your server\'s IP and MAC addresses.',
    'Answer these prompts to add your server.',
  );
  const shouldAddServer = await prompts(yesNoQuestion('Would you like to create your configuration file now (Y/n)?'));
  if (!isYes(shouldAddServer.yesNo)) return cancelCreation();

  console.log('Perfect. We\'ll ask you a few questions about your server now.');
  const serverInfo = await askServerQuestions();
  if (!serverInfo) return cancelCreation();
  console.log('\nCreating config file...');
  const fileContents = {
    _meta: {
      info: 'This file was autogenerated by Home Control. You can add or delete servers in the \'servers\' array below.',
      created: new Date().toLocaleString(),
    },
    servers: serverInfo,
  };
  fs.writeFile(configFilePath, JSON.stringify(fileContents, null, 2), (err) => {
    if (err) console.error('error', error(err));
    console.log(success('Config file created successfully!'));
    console.log(`You can edit the config file at any time at ${configFilePath}`);
  });
  return 0;
}

createConfigResponse();