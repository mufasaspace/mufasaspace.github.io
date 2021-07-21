var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

'floor|random|round|abs|sqrt|PI|atan2|sin|cos|pow|max|min'
  .split('|')
  .forEach(function(p) { window[p] = Math[p]; });

var TAU = PI*2;

function r(n) { return random()*n; }
function rrng(lo, hi) { return lo + r(hi-lo); }
function rint(lo, hi) { return lo + floor(r(hi - lo + 1)); }
function choose() { return arguments[rint(0, arguments.length-1)]; }
function choose1(args) { return args[rint(0, args.length-1)]; }

/*---------------------------------------------------------------------------*/

var W, H, frame, t0, time;
var DPR = devicePixelRatio || 1;

function dpr(n) { return n * DPR; }

function resize() {
  var w = innerWidth;
  var h = innerHeight;
  
  canvas.style.width = w+'px';
  canvas.style.height = h+'px';
  
  W = canvas.width = w * DPR;
  H = canvas.height = h * DPR;
}

function loop(t) {
  frame = requestAnimationFrame(loop);
  draw();
  time++;
}

function pause() {
  cancelAnimationFrame(frame);
  frame = frame ? null : requestAnimationFrame(loop);
}

function reset() {
  cancelAnimationFrame(frame);
  resize();
  ctx.clearRect(0, 0, W, H);
  init();
  time = 0;
  frame = requestAnimationFrame(loop);
}

/*---------------------------------------------------------------------------*/

var up = {x: 0, y: -1};
var down = {x: 0, y: 1};
var left = {x: -1, y: 0};
var right = {x: 1, y: 0};

var dirs = [up, down, left, right];

function Growth(grid, pos, dir) {
  pos = pos || grid.freeCell();
  this.x = pos.x;
  this.y = pos.y;
  this.grid = grid;
  grid.cells[pos.x][pos.y] = true;
  this.setNewDirection(dir);
}

Growth.prototype.canMove = function(dir) {
  var x = this.x + dir.x;
  var y = this.y + dir.y;
  if (x < 0 || x >= this.grid.w) return false;
  if (y < 0 || y >= this.grid.h) return false;
  return !this.grid.cells[x][y];
};

Growth.prototype.possibleDirs = function() {
  return dirs.filter(this.canMove.bind(this));
};

Growth.prototype.setNewDirection = function(dir) {
  var possibles = this.possibleDirs();
  if (!possibles.length) return this.dir = null;
  this.dir = dir || choose1(possibles);
  this.grid.cells[this.x+this.dir.x][this.y+this.dir.y] = true;
};

Growth.prototype.update = function() {
  if (this.dead) return;  
  
  this.x += this.dir.x;
  this.y += this.dir.y;
  this.setNewDirection();
  
  if (random() < 0.2) {
    var spawn = new Growth(this.grid, {x: this.x, y: this.y});
    this.grid.growths.push(spawn);
  }
};

Growth.prototype.draw = function(t) {
  if (this.dead && t > 0) return;
  var size = this.grid.size;
  var dir = this.dir ? this.dir : {x: 0, y: 0};  
  var x = this.grid.x + (this.x + dir.x*t)*size;
  var y = this.grid.y + (this.y + dir.y*t)*size;
  ctx.fillRect(x+PAD, y+PAD, size-PAD2, size-PAD2);
};

Object.defineProperty(Growth.prototype, 'dead', {
  get: function() { return !this.dir; }
});

function Grid(x, y, w, h, size) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.size = size;
  this.cells = new Array(w);
  for (var i = 0; i < w; i++) {
    this.cells[i] = new Array(h);
    for (var j = 0; j < h; j++) {
      this.cells[i][j] = false;
    }
  }
  var xx = ~~(this.w/2);
  var yy = ~~(this.h/2);
  this.growths = dirs.map(function(dir) {
    return new Growth(this, {x: xx, y: yy}, dir);
  }.bind(this));
}

Grid.prototype.freeCell = function() {
  var x, y;
  do {
    x = ~~r(this.w);
    y = ~~r(this.h);
  } while (this.cells[x][y] === true);
  return {x: x, y: y};
};

Grid.prototype.update = function() {
  this.growths.forEach(function(growth) { growth.update(); });
};

Grid.prototype.draw = function(t) {
  this.growths.forEach(function(growth) { growth.draw(t); });
};

Object.defineProperty(Grid.prototype, 'dead', {
  get: function() {
    return this.growths.every(function(g) { return g.dead; });
  }
});

/*---------------------------------------------------------------------------*/

var PAD = dpr(1);
var PAD2 = 2*PAD;
var STEP = 15;

var sz = dpr(5);

var grid;
function init() {
  var w = ~~(W/sz) - 10;
  var h = ~~(H/sz) - 10;
  w = w % 2 ? w : w - 1;
  h = h % 2 ? h : h - 1;
  var x = ~~((W-(w*sz))/2);
  var y = ~~((H-(h*sz))/2);
  grid = new Grid(x, y, w, h, sz);
  
  ctx.fillStyle = 'rgb(241,241,242)';
  ctx.fillRect(0, 0, W, H);
  var gradient = ctx.createRadialGradient(W/2, H/2, max(W/2, H/2)*1.33, W/2, H/2, 0);
  gradient.addColorStop(0, 'rgb(88, 84, 129)');
  gradient.addColorStop(0.85, 'rgb(57, 55, 77)');
  gradient.addColorStop(1, 'rgb(57, 55, 77)');
  ctx.fillStyle = gradient;
}

function draw() {
  if (time && time % STEP === 0) {
    grid.update();
  }
  var t = time % STEP / STEP;
  grid.draw(time % STEP / STEP);
  if (grid.dead) {
    pause();
    setTimeout(reset, 500);
  }
}

/*---------------------------------------------------------------------------*/

document.onclick = pause;
window.ondblclick = reset;
window.onresize = reset;

reset();