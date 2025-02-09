"use strict";

const API = require("./libs/lgtv_api.json");
const TV_DATA = require("./libs/tv_data.json");
const PACKAGE = require("./package.json");

const MyLGTV = require("./libs/LGTVbridge.js");

function __init(command, arg) {
  if(checkMacAddress() && checkArgs(command, arg))
    executeCommand(command, arg);
  else
    return false;
}

function checkMacAddress() {
  if (TV_DATA.tvMAC === null){
    console.error('\nInvalid or not specified MAC address for your device on config file\n');
    return false;
  }
  return true;
}

function executeCommand(command, arg) {
  var mylgtv = new MyLGTV();

  switch(command) {
    case 'alexa':
      mylgtv.initAlexa();
      break;
    case 'appslist':
      mylgtv.execute(API.APPS_LIST, 'subscribe', {});
      break;
    case 'servicelist':
      mylgtv.execute(API.SERVICE_LIST, 'subscribe', {});
      break;
    case 'status':
      mylgtv.execute(API.IN_USE_APP, 'subscribe', {});
      break;
    case 'appstatus':
      mylgtv.execute(API.APP_STATUS, 'subscribe', {"id": arg});
      break;
    case 'toast':
      mylgtv.execute(API.TOAST_CREATOR, 'subscribe', {"message": arg});
      break;
    case 'tvoff':
      mylgtv.turnOffTV();
      break;
    case 'tvon':
      console.log("\nTurning on " + TV_DATA.tvNAME + ' ...\n');
      mylgtv.turnOnTV('exitProcess');
      break;
    case 'mute':
      var setMute = (arg == 'true');
      mylgtv.execute(API.MUTE_TV, 'subscribe', {"mute" : setMute});
      break;
    case 'version':
      console.log('\nBridge for LG Smart TVs version: ' + PACKAGE.version + '\n');
      break;
    default:
      return;
  }
}

function checkArgs(command, arg) {
  switch(command) {
    case 'alexa':
    case 'appslist':
    case 'servicelist':
    case 'status':
    case 'tvoff':
    case 'tvon':
    case 'version':
      if(typeof arg == 'undefined')
        return true;
      break;
    case 'toast':
      if(typeof arg == 'string')
        return true;
      break;
    case 'mute':
      if(arg == 'true' || arg == 'false')
        return true;
      break;
    default:
       showInstructions();
       return false;
  }

  showInstructions();
  return false;
}

function showInstructions() {
  console.log('\n*** Bridge for LG Smart TVs ***' + ' ' + PACKAGE.version);
  console.log('\nUSAGE: node index.js <option> <parameter>');
  console.log('\nOPTIONS:');
  console.log('\t* alexa - Bridge for Amazon Alexa');
  console.log('\t* appslist - Displays info about all apps available in your TV');
  console.log('\t* servicelist - Displays info about all services available in your TV');
  console.log('\t* toast "<message>" - Displays a toast message in your TV');
  console.log('\t* tvoff - Turns off your TV');
  console.log('\t* tvon - Turns on your TV\n');
  console.log('\t* mute true|false - Mute/unmute your TV');
  console.log('\t* version - Displays the version of this bridge\n');
}

__init(process.argv[2], process.argv[3]);
