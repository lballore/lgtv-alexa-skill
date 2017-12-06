"use strict";

const ip = require("ip");
const FauxMo = require("fauxmojs");
const config = require("./config.json");
const wol = require("node-wol");

const START_PORT = 11000;
const URL = 'ws://' + config.IP + ':3000'

function turnOn(onComplete) {
  wol.wake(config.tvMAC, function(error) {
    if (error) {
      console.log("failed to turn on TV");
    } else {
      if (onComplete) {
        whenActive(onComplete);
      }
    }
  });
}

function whenActive(doFunc){
  const lgtv = require("lgtv2")({
    url: URL
  });
  lgtv.on("connect", function() {
    lgtv.subscribe("ssap://com.webos.applicationManager/getForegroundAppInfo", function(err, res){
      if (res.appId.length > 0){
        doFunc();
        lgtv.disconnect();
      }
    });
  });
}

function turnOff() {
  const lgtv = require("lgtv2")({
    url: URL
  });

  lgtv.on("connect", function() {
    console.log('connected');
    lgtv.request('ssap://system/turnOff', function(err, res) {
      lgtv.disconnect();
    });
  });
}

function launchApp(appId) {
  const lgtv = require("lgtv2")({
    url: URL
  });

  lgtv.on('connect', function() {
    console.log("launching app", appId);
    lgtv.request('ssap://system.launcher/launch', {
      id: appId
    }, function(err, res) {
      console.log(err, res);
      lgtv.disconnect();
    });
  });
}

function closeApp(appId) {
  const lgtv = require("lgtv2")({
    url: URL
  });

  lgtv.on('connect', function() {
    console.log('connected');
    lgtv.request('ssap://system.launcher/close', {
      id: appId
    }, function(err, res) {
      console.log(err, res);
      lgtv.disconnect();
    });
  });
}

function devicesList() {
  let devices = [];

  devices.push({
    name: "TV",
    port: START_PORT,
    handler: (action) => {
      console.log("tv action:", action);
      if (action == "on") {
        turnOn();
      } else {
        turnOff();
      }
    }
  });

  config.apps.forEach(function(app, index) {
      devices.push({
          name: app.name,
          port: START_PORT + index + 1,
          handler: (action) => {
            turnOn(function() {
              if (action == "on") {
                launchApp(app.id);
              } else {
                closeApp(app.id);
              }
            });
          }
      });
  });

return devices;
}

function showAppList() {
  const lgtv = require("lgtv2")({
    url: URL,
    reconnect: false
  });
  lgtv.on("connect", function() {
    lgtv.subscribe("ssap://com.webos.applicationManager/listLaunchPoints", function(err, res){
      console.log(res);
      lgtv.disconnect();
    });
  }).on("error", function(err) {
    console.error("Cannot read app list, your LG TV may not be available. Turn it on!");
    lgtv.disconnect();
  });
}

function showServiceList() {
  const lgtv = require("lgtv2")({
    url: URL,
    reconnect: false
  });
  lgtv.on("connect", function() {
    lgtv.subscribe("ssap://api/getServiceList", function(err, res){
      console.log(res);
      lgtv.disconnect();
    });
  }).on("error", function(err) {
    console.error("Cannot read service list, your LG TV may not be available. Turn it on!");
    lgtv.disconnect();
  });
}

function displayToast(msg) {
  if(typeof msg != "string") {
    console.error("No message to send");
    return;
  }

  const lgtv = require("lgtv2")({
    url: URL,
    reconnect: false
  });
  lgtv.on("connect", function() {
    lgtv.request('ssap://system.notifications/createToast', { message: msg }, function(err, res) {
      console.log("sending message " + msg);
      lgtv.disconnect()
    });
  }).on("error", function(err) {
    console.error("Cannot send message! " + err);
    lgtv.disconnect();
  });
}

function initAlexa() {
  let fauxMo = new FauxMo({
    ipAddress: ip.address(),
    devices: devicesList()
  });
}

if (config.tvMAC === null){
  console.error("Error: Enter your LG TV's MAC address into config.json!");
  return;
}

switch(process.argv[2]) {
  case 'appslist':
    console.log("Getting app list...");
    showAppList();
    break;
  case 'servicelist':
    console.log("Getting service list...");
    showServiceList();
    break;
  case 'toast':
    displayToast(process.argv[3]);
    break;
  default:
    initAlexa();
    console.log('started..');
}