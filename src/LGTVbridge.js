"use strict";

const API = require("./lgtv-api.json");
const CONFIG = require("./config.json");

const START_PORT = 11000;
const URL = 'ws://' + CONFIG.tvIP + ':3000'
const ACTION_ON = 1

var LGTVBridge = function () {
  var _self = this;

  this.initAlexa = function() {
    var ip = require("ip");
    var FauxMo = require("node-fauxmo");

    console.log('\nPreparing Amazon Alexa bridge listener...\n')
    let fauxMo = new FauxMo({
      devices: _self.getDevicesList()
    });

    console.log('Fake WEMO devices found:')
    console.log(_self.getDevicesList())
  };

  this.connectToTV = function() {
    if (!CONFIG.tvIP) {
      console.error('TV IP not defined in config');
      return null;
    }
    console.log('Connecting to TV at: ', URL);
    return require("lgtv2")({
      url: URL,
      reconnect: false
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
      name: CONFIG.tvAppNAME,
      port: START_PORT,
      handler: (action) => {
        if (action == ACTION_ON) {
          console.log("\nTurning on " + CONFIG.tvNAME + ' ...\n');
          _self.turnOnTV();
        } else {
          console.log("\nTurning off " + CONFIG.tvNAME + ' ...\n');
          _self.turnOffTV();
        }
      }
    }

    return myTV;
  };

  this.turnOnTV = function(exitProcess) {
    var wol = require("node-wol");

    wol.wake(CONFIG.tvMAC, function(error) {
      if (error) {
        console.error("Can't turn on your TV");
      } else {
        if(exitProcess == 'exitProcess')
          process.exit();
      }
    });
  };

  this.turnOffTV = function() {
    var lgtv = _self.connectToTV();
    lgtv.on("connect", function() {
      lgtv.request(API.TURN_OFF_TV, {}, function(err, res) {
        if(res.returnValue == true)
          lgtv.disconnect();
      });
    }).on("error", function(err) {
      if(err.code == 'ECONNREFUSED') {
        setTimeout(() => _self.turnOffTV(), 2000);
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
            if (action == ACTION_ON) {
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
          if (action == ACTION_ON) {
            _self.execute(func.commandON, 'subscribe', func.paramsON);
          } else {
            _self.execute(func.commandOFF, 'subscribe', func.paramsOFF);
          }
        }
      });
    });

    return functions;
  };

  this.execute = function(command, type, params, sendMagicPkg = null) {
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

