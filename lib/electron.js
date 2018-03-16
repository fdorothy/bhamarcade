'use strict';

// REQUIRES
const config = require('config');
const electron = require('electron');
const child_process = require('child_process');
const url = require('url');

// GLOBALS
let server;
let socket;
let electronWindow;

function getPort() {
  return config.get('port') || 3000;
}

function refreshBrowser() {
  if (electronWindow)
    electronWindow.loadURL(url.format({
      pathname: 'localhost:' + getPort(),
      protocol: 'http:',
      slashes: true
    }));
}

function startBrowser() {
  electronWindow = new electron.BrowserWindow({width: 800, height: 600});
  refreshBrowser();
  electronWindow.on('closed', function () {
    console.log("uh oh, closed the window!");
  })
  electronWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type == 'keyUp' && input.key == 'Escape')
      refreshBrowser();
  });
}

function main() {
  electron.app.on('ready', startBrowser)
}

main();
