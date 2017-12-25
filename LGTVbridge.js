"use strict";

const API = require("./lgtv-api.json");
const CONFIG = require("./config.json");
const START_PORT = 11000;
const URL = 'ws://' + CONFIG.tvIP + ':3000'

var LGTVBridge = function () {
  var _self = this;

  this.initAlexa = function() {
    var ip = require("ip");
    var FauxMo = require("fauxmojs");

    console.log('\nPreparing Amazon Alexa bridge listener...\n')
    let fauxMo = new FauxMo({
      ipAddress: ip.address(),
      devices: _self.getDevicesList()
    });
  };

  this.connectToTV = function() {
    return require("lgtv2")({
      url: URL
    });
  };

  this.getDevicesList = function() {
    var tv = [_self.initTV()];
    var apps = _self.initApps();
    var functions = _self.initFunctions();
    var devices = tv.concat(apps).concat(functions);

    return devices;
  };

  this.initTV = function() {
    var myTV = {
      name: CONFIG.tvNAME,
      port: START_PORT,
      handler: (action) => {
        console.log("Executing TV action:", action);
        if (action == "on") {
          _self.turnOnTV();
        } else {
          _self.turnOffTV();
        }
      }
    }

    return myTV;
  };

  this.turnOnTV = function(exitProcess) {
    var wol = require("node-wol");

    console.log("\nTurning on " + CONFIG.tvNAME + ' ...\n');
    wol.wake(CONFIG.tvMAC, function(error) {
      if (error) {
        console.error("Can't turn on your TV");
      }
      if(exitProcess == 'exitProcess')
        process.exit();
    });
  };

  this.turnOffTV = function(exitProcess) {
    var lgtv = _self.connectToTV();
    lgtv.on("connect", function() {
      lgtv.subscribe(API.TURN_OFF_TV, {}, function(err, res) {
        console.log("\nTurning off " + CONFIG.tvNAME + ' ...\n');
        lgtv.disconnect();
      });
    }).on("error", function(err) {
      if(err.code == 'ECONNREFUSED') {
        console.log('\nReconnecting...\n');
        _self.turnOffTV();
      } else {
        console.error("Error while turning off your TV:", err);
        lgtv.disconnect();
      }
    });
  };

  this.initApps = function() {
    var supportedApps = require("./apps.json");
    var applications = [];

    supportedApps.forEach(function(app, index) {
      applications.push({
          name: app.displayName,
          port: START_PORT + (index + 1),
          handler: (action) => {
            if (action == "on") {
              console.log("APP: Turning " + app.displayName + ' ON');
              _self.execute(API.APP_LAUNCHER, 'request', {id: app.id}, 'sendMagicPkg');
            } else {
              console.log("APP: Turning " + app.displayName + ' OFF');
              _self.execute(API.APP_CLOSER, 'request', {id: app.id});
            }
          }
      });
    });

    return applications;
  };

  this.initFunctions = function() {
    var supportedFunctions = require("./functions.json");
    var functions = [];

    supportedFunctions.forEach(function(func, index) {
      functions.push({
        name: func.displayName,
        port: START_PORT + 100 + (index + 1),
        handler: (action) => {
          if (action == "on") {
            _self.execute(func.commandON, 'subscribe', func.paramsON);
          } else {
            _self.execute(func.commandOFF, 'subscribe', func.paramsOFF);
          }
        }
      });
    });

    return functions;
  };

  this.execute = function(command, type, params, sendMagicPkg) {
    if (sendMagicPkg === 'sendMagicPkg') {
      _self.turnOnTV();
      _self.runFunction(command, type, params);
    } else {
      _self.runFunction(command, type, params);
    }
  };

  this.runFunction = function(command, type, params){
    if (type == 'request') {
      _self.runRequestFunction(command, params);
    } else {
      _self.runSubscribeFunction(command, params);
    }
  };

  this.runRequestFunction = function(command, params) {
    var lgtv = _self.connectToTV();

    lgtv.on("connect", function() {
      lgtv.request(command, params, function(err, res) {
        console.log('API:', command);
        console.log('Results:', res);
        lgtv.disconnect();
      });
    }).on("error", function(err) {
      console.error("Error while running", command);
      console.error('ERROR:', err);
      lgtv.disconnect();
    });
  };

  this.runSubscribeFunction = function(command, params) {
    var lgtv = _self.connectToTV();

    lgtv.on("connect", function() {
      lgtv.subscribe(command, params, function(err, res) {
        console.log('API:', command);
        console.log('Results:', res);
        lgtv.disconnect();
      });
    }).on("error", function(err) {
      console.error("Error while running", command);
      console.error('ERROR:', err);
      lgtv.disconnect();
    });
  };
  
}

module.exports = LGTVBridge;

