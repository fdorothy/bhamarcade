# bhamarcade

Birmingham Arcade game-selector server. This will automatically sync the games with an s3 controller, and serve them up through Node + Express.

This will also bring up an electronjs window with the game menu.

## install

```npm i```

You ALSO need the AWS command line tools.

```sudo apt-get install awscli```

You'll need to setup credentials as well. Just leave the keys blank, and
if asked for a region specify us-east-1.

```aws credentials```

## running

This will bring up the server and an electron browser menu with the game menu:

```npm start```
