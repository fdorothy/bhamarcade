// deps
const games = require('./games.js'),
      PIXI = require('pixi.js'),
      tweenManager = require('pixi-tween')

// consts
const H_FONT = {fontfamily: "Arial", fontSize: 24, fill: "white"},
      P_FONT = {fontfamily: "Arial", fontSize: 16, fill: "white"},
      ITEM_SIZE = [196, 196];

// globals
let renderer,
    stage,
    items,
    cursor,
    desc,
    itemIdx = 0;

function setupRenderer() {
  renderer = PIXI.autoDetectRenderer(256, 256);
  document.body.appendChild(renderer.view);
  renderer.view.style.position = "absolute";
  renderer.view.style.display = "block";
  renderer.autoResize = true;
  renderer.resize(window.innerWidth, window.innerHeight);
  stage = new PIXI.Container();
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

function setCurrentGame(index) {
  if (index >= 0 && index < games.length) {
    itemIdx = index;
    var t = PIXI.tweenManager.createTween(items);
    t.time = 750;
    t.easing = PIXI.tween.Easing.outCubic();
    t.to({x: -(itemIdx+0.5)*ITEM_SIZE[0] + renderer.view.width/2});
    t.start();
  }
}

function setupInput() {
  var left = keyboard(37), right = keyboard(39);
  left.release = () => {setCurrentGame(itemIdx-1)};
  right.release = () => {setCurrentGame(itemIdx+1)};
}

function createItem(info) {
  var group = new PIXI.Container();
  group.info = info;

  var name = new PIXI.Text(info['name'], H_FONT);
  name.anchor.set(0.5, 0.0);
  name.position.set(ITEM_SIZE[0]/2, ITEM_SIZE[1]);
  group.addChild(name);

  var s = new PIXI.Sprite(PIXI.loader.resources[info['thumbnail']].texture);
  s.anchor.set(0.5, 0.5);
  s.position.set(ITEM_SIZE[0]/2.0, ITEM_SIZE[1]/2.0);
  group.addChild(s);
  return group;
}

function createItems() {
  items = new PIXI.Container();
  items.x = renderer.view.width / 2 - ITEM_SIZE[0] / 2;
  for (var i=0; i<games.length; i++) {
    var s = createItem(games[i]);
    s.position.set(i*ITEM_SIZE[0], 0.0);
    items.addChild(s);
  }
  stage.addChild(items);
}

function createCursorSprite() {
  var graphics = new PIXI.Graphics();
  graphics.lineStyle(5, 0xFFFFFF, 1);
  graphics.drawRoundedRect(0, 0, ITEM_SIZE[0], ITEM_SIZE[1], 10);
  var tex = renderer.generateTexture(graphics);
  cursor = new PIXI.Sprite(tex);
  cursor.anchor.x = 0.5;
  cursor.x = renderer.view.width / 2;
  stage.addChild(cursor);
}

function createDescriptionSprite() {
  desc = new PIXI.Text("blah blah", P_FONT);
  desc.position.set(50, ITEM_SIZE[1] + 50);
  stage.addChild(desc);
}

function setup() {
  setupInput();
  setupRenderer();
  createItems();
  createCursorSprite();
  createDescriptionSprite();
  renderer.render(stage);
  animate();
}

function animate() {
  requestAnimationFrame(animate);
  PIXI.tweenManager.update();
  renderer.render(stage);
}

function getThumbnails() {
  thumbnails = [];
  games.forEach((game) => {
    var img = game["thumbnail"];
    if (img && !thumbnails.includes(img))
      thumbnails.push(game["thumbnail"]);
  });
  return thumbnails;
}

function main() {
  PIXI.loader
    .add(getThumbnails())
    .load(setup);
}

main();
