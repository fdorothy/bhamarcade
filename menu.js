// deps
const config = require('./games.js');
const PIXI = require('pixi.js');
const tweenManager = require('pixi-tween');

// globals
var renderer = PIXI.autoDetectRenderer(256, 256);
var loader = PIXI.loader;
var resources = PIXI.loader.resources;
var Sprite = PIXI.Sprite;
var stage = new PIXI.Container();
var graphics = new PIXI.Graphics();
//var charm = new Charm(PIXI);
var hFont = {fontfamily: "Arial", fontSize: 24, fill: "white"};
var pFont = {fontfamily: "Arial", fontSize: 16, fill: "white"};
var tweener = null;
var sprite;
var currentGame = 0;
var games = [];
var gamesContainer;
var spriteWidth = 196;
var spriteHeight = 196;
var cursorSprite;
var descSprite;

function setupRenderer() {
  renderer.view.style.position = "absolute";
  renderer.view.style.display = "block";
  renderer.autoResize = true;
  renderer.resize(window.innerWidth, window.innerHeight);
}

function keyboard(keyCode) {
  var key = {};
  key.code = keyCode;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  key.downHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
    }
    event.preventDefault();
  };
  key.upHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
    }
    event.preventDefault();
  };
  window.addEventListener(
    "keydown", key.downHandler.bind(key), false
  );
  window.addEventListener(
    "keyup", key.upHandler.bind(key), false
  );
  return key;
}

function setCurrentGame(gameIdx) {
  if (gameIdx < 0 || gameIdx >= games.length) {
    return;
  } else {
    if (tweener) {
      tweener = null;
    }
    currentGame = gameIdx;
    //gamesContainer.x = -(gameIdx+0.5)*spriteWidth + renderer.view.width/2;
    tweener = PIXI.tweenManager.createTween(gamesContainer);
    tweener.time = 750;
    tweener.easing = PIXI.tween.Easing.outCubic();
    tweener.to({x: -(gameIdx+0.5)*spriteWidth + renderer.view.width/2});
    tweener.start();
    // tweener = charm.slide(
    //   gamesContainer,
    //   -gameIdx*128-64 + renderer.view.width/2,
    //   gamesContainer.y,
    //   60
    // );
  }
}

function setupInput() {
  var left = keyboard(37),
      right = keyboard(39);
  left.release = function() {
    setCurrentGame(currentGame-1);
  }
  right.release = function() {
    setCurrentGame(currentGame+1);
  }
}

function createGameSprite(game) {
  var group = new PIXI.Container();
  console.log("making sprites for " + game['name']);

  var name = new PIXI.Text(game['name'], hFont);
  name.anchor.x = 0.5;
  name.anchor.y = 0.0;
  name.x = spriteWidth/2;
  name.y = spriteHeight;
  group.addChild(name);

  var s = new Sprite(resources[game['thumbnail']].texture);
  s.anchor.x = 0.5;
  s.anchor.y = 0.5;
  s.x = spriteWidth/2.0;
  s.y = spriteHeight/2.0;
  group.addChild(s);
  group.info = game;
  return group;
}

function setupGames() {
  var x = 0;
  var y = 0;
  gamesContainer = new PIXI.Container();
  gamesContainer.x = renderer.view.width / 2 - spriteWidth / 2;
  for (var i in config) {
    var s = createGameSprite(config[i]);
    s.x = x*spriteWidth;
    s.y = y*spriteHeight;
    gamesContainer.addChild(s);
    x += 1;
    games.push(s);
  }
  stage.addChild(gamesContainer);
}

function createCursorSprite() {
  graphics.lineStyle(5, 0xFFFFFF, 1);
  //graphics.beginFill(0x00);
  graphics.drawRoundedRect(0, 0, spriteWidth, spriteHeight, 10);
  //graphics.endFill();
  //graphics.lineTo(0, 50);
  //graphics.lineTo(50, 50);
  // graphics.lineTo(spriteWidth, 0);
  // graphics.lineTo(0, 0);
  var tex = renderer.generateTexture(graphics);
  cursorSprite = new PIXI.Sprite(tex);
  cursorSprite.anchor.x = 0.5;
  cursorSprite.x = renderer.view.width / 2;
  stage.addChild(cursorSprite);
}

function createDescriptionSprite() {
  descSprite = new PIXI.Text("blah blah", pFont);
  descSprite.x = 50;
  descSprite.y = spriteHeight + 50;
  stage.addChild(descSprite);
}

function setup() {
  setupInput();
  setupRenderer();
  setupGames();
  createCursorSprite();
  createDescriptionSprite();
  renderer.render(stage);
  gameLoop();
}

function gameLoop() {
  requestAnimationFrame(gameLoop);
  //charm.update();

  renderer.render(stage);
  PIXI.tweenManager.update();
}

function main() {
  document.body.appendChild(renderer.view);

  // load all thumbnails from the games
  thumbnails = [];
  config.forEach((item) => {
    var img = item["thumbnail"];
    if (img && !thumbnails.includes(img))
      thumbnails.push(item["thumbnail"]);
  });

  loader
    .add(thumbnails)
    .load(setup);
}

main();
