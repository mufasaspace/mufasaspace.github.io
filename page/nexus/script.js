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

function Growth(grid) {
  var pos = grid.freeCell();
  this.x = pos.x;
  this.y = pos.y;
  this.grid = grid;
  grid.cells[pos.x][pos.y] = true;
  this.setNewDirection();
}

Growth.prototype.canMove = function(dir) {
  var x = this.x + dir.x;
  var y = this.y + dir.y;
  if (x < 0 || x >= this.grid.dim) return false;
  if (y < 0 || y >= this.grid.dim) return false;
  return !this.grid.cells[x][y];
};

Growth.prototype.possibleDirs = function() {
  return dirs.filter(this.canMove.bind(this));
};

Growth.prototype.setNewDirection = function() {
  var possibles = this.possibleDirs();
  if (!possibles.length) return this.dir = null;
  this.dir = choose1(possibles);
  this.grid.cells[this.x+this.dir.x][this.y+this.dir.y] = true;
};

Growth.prototype.update = function() {
  if (this.dead) return;  
  
  this.x += this.dir.x;
  this.y += this.dir.y;
  this.setNewDirection();
};

Growth.prototype.draw = function(t) {
  var dir = this.dead ? {x: 0, y:0} : this.dir;
  var size = this.grid.size;
  
  var x = this.grid.x + (this.x + dir.x*t)*size;
  var y = this.grid.y + (this.y + dir.y*t)*size;
  ctx.fillRect(x+PAD, y+PAD, size-PAD2, size-PAD2);
};

Object.defineProperty(Growth.prototype, 'dead', {
  get: function() { return !this.dir; }
});

function Grid(x, y, size, dim) {
  this.x = x;
  this.y = y;
  this.size = size;
  this.dim = dim;
  this.cells = new Array(dim);
  for (var i = 0; i < dim; i++) {
    this.cells[i] = new Array(dim);
    for (var j = 0; j < dim; j++) {
      this.cells[i][j] = false;
    }
  }
  this.growths = [];
  for (var i = 0; i < dim; i++) {
    this.growths[i] = new Growth(this);
  }
}

Grid.prototype.freeCell = function() {
  var x, y;
  do {
    x = ~~r(this.dim);
    y = ~~r(this.dim);
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

var PAD = dpr(2);
var PAD2 = 2*PAD;
var STEP = 10;

var w = 2;
var h = 2;
var sz = dpr(10);
var dim = 4;
var spc = 2;

var grids;
function init() {
  grids = [];

  var ww = (w * sz * dim) + (w-1)*spc*sz;
  var hh = (h * sz * dim) + (h-1)*spc*sz;
  var offsetX = ~~((W - ww)/2);
  var offsetY = ~~((H - hh)/2);
  for (var i = 0; i < w; i++) {
   for (var j = 0; j < h; j++) {
     var grid = new Grid(offsetX + (i * (dim+spc) * sz), 
                         offsetY + (j * (dim+spc) * sz), 
                         sz, dim);
     grids.push(grid);
   } 
  }
  
  ctx.fillStyle = 'rgb(57, 55, 77)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgb(241, 241, 242)';
}

function draw() {
  if (time && time % STEP === 0) {
    grids.forEach(function(g) { g.update(); });
  }
  var t = time % STEP / STEP;
  grids.forEach(function(g) { g.draw(t); });
  if (grids.every(function(g) { return g.dead; })) {
    pause();
    setTimeout(reset, 1000);
  }
}

/*---------------------------------------------------------------------------*/

document.onclick = pause;
window.onresize = reset;

reset();