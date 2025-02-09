"use strict";

const API = require("./lgtv_api.json");
const TV_DATA = require("./tv_data.json");

const START_PORT = 11000;
const URL = 'ws://' + TV_DATA.tvIP + ':3000'
const KEYFILE_PATH = '/var/tmp/lgtv.key';
const ACTION_ON = 1

var LGTVBridge = function () {
  var _self = this;

  this.initAlexa = function () {
    var FauxMo = require("node-fauxmo");

    console.log('\nPreparing Amazon Alexa bridge listener...\n')

    try {
      new FauxMo({
        devices: _self.getDevicesList(),
      });
      console.log('FauxMo initialized successfully');
    }
    catch (err) {
      console.error('FauxMo initialization error:', err);
      console.error('Stack:', err.stack);
    }
  };

  this.connectToTV = function () {
    const wsUrl = 'ws://' + TV_DATA.tvIP + ':3000';

    let clientKey = '';
    try {
      const fs = require('fs');
      if (fs.existsSync(KEYFILE_PATH)) {
        clientKey = fs.readFileSync(KEYFILE_PATH, 'utf8');
        console.log("Found existing client key");
      }
    }
    catch (err) {
      console.error("Error reading key file:", err);
    }

    try {
      const lgtv2 = require("lgtv2");

      const options = {
        url: wsUrl,
        reconnect: false,
        saveKey: false,
        keyFile: KEYFILE_PATH,
        clientKey: clientKey
      };
      const lgtv = lgtv2(options);

      lgtv.on('prompt', function () {
        console.log('TV is asking for permission - please accept the connection request');
      });
      lgtv.on('connect', function(response) {
        if (response && response['client-key']) {
          console.log("Saving client key ...");
          _self.saveTVKey(response['client-key']);
        }
      });

      return lgtv;
    }
    catch (err) {
      console.error("Detailed error in connectToTV:", err);
      return null;
    }
  };

  this.saveTVKey = function (clientKey) {
    try {
      const fs = require('fs');
      fs.writeFileSync(KEYFILE_PATH, clientKey);
      console.log("Client key saved.");
    }
    catch (err) {
      console.error("Error saving key file:", err);
    }
  };

  this.getDevicesList = function () {
    console.log('Getting devices...');

    var devices = [];

    var tv = _self.initTV();
    var apps = _self.initApps();
    var functions = _self.initFunctions();

    devices = devices.concat(tv).concat(apps).concat(functions);
    // Log each device with handler info
    devices.forEach(d => {
      console.log(`Device ${d.name}: has handler = ${typeof d.handler === 'function'}, port = ${d.port}`);
    });

    return devices;
  };

  this.initTV = function () {
    var myTV = {
      name: TV_DATA.tvAppNAME,
      port: START_PORT,
      handler: (action) => {
        if (action == ACTION_ON) {
          console.log("\nTurning on " + TV_DATA.tvNAME + ' ...\n');
          _self.turnOnTV();
        } else {
          console.log("\nTurning off " + TV_DATA.tvNAME + ' ...\n');
          _self.turnOffTV();
        }
      }
    }

    return myTV;
  };

  this.turnOnTV = function (exitProcess) {
    var wol = require("node-wol");

    wol.wake(TV_DATA.tvMAC, function (error) {
      if (error) {
        console.error("Can't turn on your TV");
      } else {
        if (exitProcess == 'exitProcess')
          process.exit();
      }
    });
  };

  this.turnOffTV = function () {
    console.log("turnOffTV called");
    var lgtv = _self.connectToTV();

    if (!lgtv) {
      console.error("Could not create TV connection");
      return;
    }

    console.log("Attempting to connect to TV at:", URL);

    lgtv.on("connect", function () {
      lgtv.request(API.TURN_OFF_TV, {}, function (err, res) {
        if (res && res.returnValue == true) {
          console.log("TV turning off successfully");
          lgtv.disconnect();
        }
      });
    }).on("error", function (err) {
      console.log("TV connection error:", err);
      if (err.code == 'ECONNREFUSED') {
        setTimeout(() => _self.turnOffTV(), 2000);
      } else {
        console.error("Error while turning off your TV:", err);
        lgtv.disconnect();
      }
    });
  };

  this.initApps = function () {
    var supportedApps = require("./apps.json");
    var applications = [];

    supportedApps.forEach(function (app, index) {
      applications.push({
        name: app.displayName,
        port: START_PORT + (index + 1),
        handler: (action) => {
          if (action == ACTION_ON) {
            console.log("APP: Turning " + app.displayName + ' ON');
            _self.execute(API.APP_LAUNCHER, 'request', { id: app.id }, 'sendMagicPkg');
          } else {
            console.log("APP: Turning " + app.displayName + ' OFF');
            _self.execute(API.APP_CLOSER, 'request', { id: app.id });
          }
        }
      });
    });

    return applications;
  };

  this.initFunctions = function () {
    var supportedFunctions = require("./functions.json");
    var functions = [];

    supportedFunctions.forEach(function (func, index) {
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

  this.execute = function (command, type, params, sendMagicPkg = null) {
    if (sendMagicPkg === 'sendMagicPkg') {
      _self.turnOnTV();
      _self.runFunction(command, type, params);
    } else {
      _self.runFunction(command, type, params);
    }
  };

  this.runFunction = function (command, type, params) {
    if (type == 'request') {
      _self.runRequestFunction(command, params);
    } else {
      _self.runSubscribeFunction(command, params);
    }
  };

  this.runRequestFunction = function (command, params) {
    var lgtv = _self.connectToTV();

    lgtv.on("connect", function () {
      lgtv.request(command, params, function (err, res) {
        console.log('API:', command);
        console.log('Results:', res);
        lgtv.disconnect();
      });
    }).on("error", function (err) {
      console.error("Error while running", command);
      console.error('ERROR:', err);
      lgtv.disconnect();
    });
  };

  this.runSubscribeFunction = function (command, params) {
    var lgtv = _self.connectToTV();

    lgtv.on("connect", function () {
      lgtv.subscribe(command, params, function (err, res) {
        console.log('API:', command);
        console.log('Results:', res);
        lgtv.disconnect();
      });
    }).on("error", function (err) {
      console.error("Error while running", command);
      console.error('ERROR:', err);
      lgtv.disconnect();
    });
  };

}

module.exports = LGTVBridge;
