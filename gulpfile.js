var gulp = require('gulp'),
    spawn = require('child_process').spawn,
    child_process = require('child_process'),
    CronJob = require('cron').CronJob,
    node,
    syncing = false,
    changes = false;

var TIMEZONE = 'America/Chicago';
var S3_SYNC_CRON = '00 * * * * *';
var S3_BUCKET = 's3://fdorothy-bhamarcade';

gulp.task('s3sync', () => {
  if (!syncing) {
    syncing=true;
    child_process.execFile("aws", ['s3', 'sync', S3_BUCKET, 'public'], (error, stdout, stderr) => {
      console.log(stdout);
      if (error)
        console.log("couldn't sync with s3://" + S3_BUCKET + ": " + error);
      syncing=false;
    });
  }
});

gulp.task('server', function() {
  if (node) node.kill()
  node = spawn('node', ['index.js'], {stdio: 'inherit'})
  node.on('close', function (code) {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...');
    }
  });
})

function startIfNotSyncing() {
  if (!syncing) {
    gulp.run('server');
    changes = false;
  } else {
    console.log("waiting to restart until finished syncing with s3...");
    setTimeout(startIfNotSyncing, 5000)
  }
}

gulp.task('default', function() {
  gulp.run('s3sync')
  gulp.run('server')

  // auto-sync files from s3
  new CronJob(S3_SYNC_CRON, function() {
    gulp.run('s3sync')
  }, null, true, TIMEZONE);

  gulp.watch(['./public/**/*'], function() {
    if (!changes) {
      changes = true;
      startIfNotSyncing();
    }
  })
})

// clean up if an error goes unhandled.
process.on('exit', function() {
    if (node) node.kill()
})
