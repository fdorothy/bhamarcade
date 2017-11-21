'use strict';

// REQUIRES
const electron = require('electron');
const express = require('express');
const gulp = require('gulp');
const child_process = require('child_process');
const url = require('url');
const cron = require('cron');

// CONFIGURATION VARIABLES
var CHECK_UPDATES = false;
var TIMEZONE = 'America/Chicago';
var CHECK_UPDATES_CRON = '00 * * * * *';
var S3_BUCKET = 's3://fdorothy-bhamarcade';

// GLOBALS
var syncing = false;
var changes = false;
let server;
let socket;
let electronWindow;

function startExpress() {
  if (socket)
    socket.close();
  server = express();
  server.use(express.static('public'))
  socket = server.listen(3000, () => console.log("=== birmingham arcade ==="));
  refreshBrowser();
}

function restart() {
  if (!syncing) {
    startExpress();
    changes = false;
  } else {
    console.log("waiting to restart until finished syncing with s3...");
    setTimeout(restart, 5000);
  }
}

function refreshBrowser() {
  if (electronWindow)
    electronWindow.loadURL(url.format({
      pathname: 'localhost:3000',
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
}

function checkUpdates() {
  if (!CHECK_UPDATES) return;
  if (!syncing) {
    syncing=true;
    child_process.execFile("aws", ['s3', 'sync', S3_BUCKET, 'public', '--no-sign-request'], (error, stdout, stderr) => {
      console.log(stdout);
      if (error)
        console.log("couldn't sync with " + S3_BUCKET + ": " + error);
      syncing=false;
    });
  }
};

function main() {
  checkUpdates();
  startExpress();
  electron.app.on('ready', startBrowser)

  // auto-sync files from s3 using a cron-like job
  new cron.CronJob(CHECK_UPDATES_CRON, checkUpdates, true, TIMEZONE);

  // auto restart server / browser on any changes
  gulp.watch(['./public/**/*'], function() {
    console.log("detected changes");
    if (!changes) {
      changes = true;
      setTimeout(restart, 1000)
    }
  })
}

main();
