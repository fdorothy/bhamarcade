games = [
  {
    "name": "Cave of Fear",
    "alias": "cof",
    "author": "Fredric Dorothy",
    "thumbnail": "./public/games/cof/images/thumbnail.png",
    "about": "./public/games/cof/docs/gameplay.md",
    "source": {
      "git": "http://github.com/fdorothy/caveoffear",
      "branch": "bhamarcade"
    },
    "setup": "npm install && npm run deploy",
    "start": "static-server . -p {{port}}",
    "stop": "echo 'stopping'",
    "url": "http://localhost:{{port}}"
  }
  {
    "name": "minesweeper",
    "alias": "ms",
    "author": "Microsoft",
    "thumbnail": "./public/games/ms/images/thumbnail.png",
    "about": "./public/games/ms/docs/gameplay.md",
    "source": {
      "web": "http://microsoft.com/games/minesweeper-v1.0.2.zip"
    },
    "setup": "unzip minesweeper.zip",
    "start": "./minesweeper-v1.0.2/mines.exe",
    "stop": "echo 'stopping'",
  }
]

module.exports = games
