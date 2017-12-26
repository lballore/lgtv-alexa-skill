"use strict";

const API = require("./lgtv-api.json");
const CONFIG = require("./config.json");
const PACKAGE = require("./package.json");

const MyLGTV = require("./LGTVbridge.js");

function __init(command, arg) {
  if(checkMacAddress() && checkArgs(command, arg))
    executeCommand(command, arg);
  else
    return false;
}

function checkMacAddress() {
  if (CONFIG.tvMAC === null){
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
      mylgtv.turnOffTV('exitProcess');
      break;
    case 'tvon':
      mylgtv.turnOnTV('exitProcess');
      break;
    case 'mute':
      var setMute = (arg == 'true');
      mylgtv.execute(API.MUTE_TV, 'subscribe', {"mute" : setMute});
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
}


__init(process.argv[2], process.argv[3]);

