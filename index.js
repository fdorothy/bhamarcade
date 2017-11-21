'use strict';

// REQUIRES
const config = require('./config.js');
const electron = require('electron');
const express = require('express');
const gulp = require('gulp');
const child_process = require('child_process');
const url = require('url');
const cron = require('cron');
const browserify = require('browserify');
const watchify = require('watchify');
var fs = require('fs');

// GLOBALS
var syncing = false;
var changes = false;
let server;
let socket;
let electronWindow;
let b; // browserify

function startExpress() {
  if (socket)
    socket.close();
  server = express();
  server.use(express.static('public'))
  var port = config.PORT || 3000
  socket = server.listen(port, () => {
    console.log("=== birmingham arcade (http://localhost:" + port + ") ===")
    refreshBrowser();
  });
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
  if (!config.CHECK_UPDATES) return;
  if (!syncing) {
    syncing=true;
    child_process.execFile("aws", ['s3', 'sync', config.S3_BUCKET, 'public', '--no-sign-request'], (error, stdout, stderr) => {
      console.log(stdout);
      if (error)
        console.log("couldn't sync with " + config.S3_BUCKET + ": " + error);
      syncing=false;
    });
  }
};

function bundle() {
  console.log("rebundle");
  b.bundle().pipe(fs.createWriteStream('public/bundle.js'));
}

function autoReload() {
  // auto restart server / browser on any changes
  gulp.watch(['./public/**/*'], function() {
    console.log("detected changes");
    if (!changes) {
      changes = true;
      setTimeout(restart, 1000)
    }
  })
}

function autoBundle() {
  // setup watchify for menu/main.js -> public/bundle.js
  b = browserify({
    entries: ['menu/main.js'],
    cache: {},
    packageCache: {},
  });
  b.plugin(watchify, {
    delay: 100,
    poll: false
  });

  b.on('update', bundle);
  bundle();
}

function main() {
  checkUpdates();
  startExpress();
  electron.app.on('ready', startBrowser)

  // auto-sync files from s3 using a cron-like job
  new cron.CronJob(config.CHECK_UPDATES_CRON, checkUpdates, true, config.TIMEZONE);

  autoReload();
  autoBundle();
}

main();
