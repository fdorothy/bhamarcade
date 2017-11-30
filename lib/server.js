'use strict';

// REQUIRES
const config = require('config');
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

function getPort() {
  return config.get('port') || 3000;
}

function startExpress() {
  if (socket)
    socket.close();
  server = express();
  server.use(express.static('public'))
  var port = getPort()
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

function checkUpdates() {
  if (!config.get('check_updates')) return;
  if (!syncing) {
    bucket = config.get('s3_bucket');
    syncing=true;
    child_process.execFile("aws", ['s3', 'sync', bucket, 'public', '--no-sign-request'], (error, stdout, stderr) => {
      console.log(stdout);
      if (error)
        console.log("couldn't sync with " + bucket + ": " + error);
      syncing=false;
    });
  }
};

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

function bundle(browserify_obj, path) {
  var writer = fs.createWriteStream(path);
  browserify_obj.bundle((err, buf) => {
    if (err)
      console.log("error: " + err);
    else
      writer.write(buf);
  });
}

function autoBundleDemo() {
  // setup watchify for client.js -> public/bundle.js
  var b = browserify({
    entries: ['./lib/client.js'],
    cache: {},
    packageCache: {},
    transform: [ "browserify-shim" ]
  });
  b.external('pixi.js');
  //b.external('pixi-tween');
  b.plugin(watchify, {
    delay: 100,
    poll: false
  });
  b.on('update', () => bundle(b, 'docs/bundle.js'));
  b.on('error', (err) => {console.log("error: ");});
  bundle(b, 'docs/bundle.js');
}

function autoBundlePublic() {
  // setup watchify for client.js -> public/bundle.js
  var b = browserify({
    entries: ['./lib/client.js'],
    cache: {},
    packageCache: {},
  });
  b.plugin(watchify, {
    delay: 100,
    poll: false
  });
  b.on('update', () => bundle(b, 'public/bundle.js'));
  b.on('error', (err) => {console.log("error: ");});
  bundle(b, 'public/bundle.js');
}

function main() {
  checkUpdates();
  startExpress();
  electron.app.on('ready', startBrowser)

  // auto-sync files from s3 using a cron-like job
  new cron.CronJob(config.get('check_updates_cron'), checkUpdates, true, config.get('timezone'));

  autoReload();
  autoBundlePublic();
  autoBundleDemo();
}

main();
