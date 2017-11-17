# bhamarcade

Birmingham Arcade game-selector server. This will automatically sync the games with an s3 controller, and serve them up through Node + Express.

## install

```npm i```

You also need gulp-cli if you want the auto-sync with s3 stuff to work.

```sudo npm install --global gulp-cli```

## running

You can either run the server directly (this will not auto-update)

```node index.js```

The default gulp task will start the server and keep it synced with s3 based
on the cron timer. Take a look at gulpfile.js for more details.

```gulp```