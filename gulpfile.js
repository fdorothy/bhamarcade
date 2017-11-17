var gulp = require('gulp'),
    spawn = require('child_process').spawn,
    node;
var child_process = require('child_process');
var CronJob = require('cron').CronJob;

gulp.task('s3sync', () => {
  console.log("syncing");
  child_process.execFile("aws", ['s3', 'sync', 's3://fdorothy-bhamarcade', 'public'], (error, stdout, stderr) => {
    if (error)
      console.log(`couldn't sync with s3://fdorothy-bhamaracde: ${error}`);
    console.log(stdout);
  });
});

/**
 * $ gulp server
 * description: launch the server. If there's a server already running, kill it.
 */
gulp.task('server', function() {
  if (node) node.kill()
  node = spawn('node', ['index.js'], {stdio: 'inherit'})
  node.on('close', function (code) {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...');
    }
  });
})

/**
 * $ gulp
 * description: start the development environment
 */
gulp.task('default', function() {
  gulp.run('server')

  // auto-sync files from s3
  new CronJob('00 * * * * *', function() {
    gulp.run('s3sync')
  }, null, true, 'America/Chicago');

  gulp.watch(['./public/**/*'], function() {
    gulp.run('server')
  })
  
  // Need to watch for sass changes too? Just add another watch call!
  // no more messing around with grunt-concurrent or the like. Gulp is
  // async by default.
})

// clean up if an error goes unhandled.
process.on('exit', function() {
    if (node) node.kill()
})
