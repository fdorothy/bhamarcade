// deps
const config = require('config');
const games = require('./games.js');
const child_process = require('child_process');
const fs = require('fs');
const path = require('path');

function download(destination, source) {
  fname = path.basename(source);
  result = child_process.execFileSync(
    'wget', [source, '-O', './tmp/' + fname]
  );
}

function gitClone(destination, repoUrl, branch) {
  result = child_process.execFileSync(
    'git', ['clone', '--depth', '1', '-b', branch, repoUrl, destination]
  );
}

function gitPull(path) {
  result = child_process.execFileSync(
    'git', ['pull', '--depth', '1'],
    {cwd: path}
  );
}

function updateGame(game) {
  if ('git' in game.source) {
    gitPull('./games/' + game.alias);
  } else {
    console.log('not updating ' + game.alias + ', not sure how');
  }
}

function fetchGame(game) {
  var destination = './games/' + game.alias;
  if (game.source) {
    if ('url' in game.source) {
      download(destination, game.source.url);
    } else if ('git' in game.source) {
      gitClone(destination, game.source.git, game.source.branch);
    }
  } else {
    console.log('cannot fetch ' + game.alias + ', no source');
  }
}

function checkGame(game) {
  if (fs.existsSync('./games/' + game.alias)) {
    console.log("updating " + game.alias);
    updateGame(game);
  } else {
    console.log("fetching " + game.alias);
    fetchGame(game);
  }
}

function updateGames() {
  games.forEach((game) => {
    checkGame(game);
  });
}

function main() {
  if (!fs.existsSync('./games'))
    fs.mkdirSync('./games');
  updateGames();
}

main();
