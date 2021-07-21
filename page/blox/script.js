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

var N = {x: 0, y: -1};
var S = {x: 0, y: 1};
var W = {x: -1, y: 0};
var E = {x: 1, y: 0};
var NW = {x: -1, y: -1};
var NE = {x: 1, y: -1};
var SW = {x: -1, y: 1};
var SE = {x: 1, y: 1};

var dirs = [N, S, E, W, NW, NE, SW, SE];

Object.defineProperty(Array.prototype, 'last', {
  get: function() { return this[this.length-1]; }
});

function pt(x, y) { return {x: x, y: y}; }
pt.add = function(a, b) { return pt(a.x+b.x, a.y+b.y); };

function Path(grid, pos, dir) {
  pos = pos || grid.freeCell();
  this.grid = grid;
  this.points = [pos];
  grid.cells[pos.x][pos.y] = true;
  this.setNewDirection(dir);
}

Path.prototype.canMove = function(dir) {
  var last = this.points.last;
  var next = pt.add(last, dir);
  if (next.x < 0 || next.x >= this.grid.w) return false;
  if (next.y < 0 || next.y >= this.grid.h) return false;
  return !this.grid.cells[next.x][next.y];
};

Path.prototype.possibleDirs = function() {
  return dirs.filter(this.canMove.bind(this));
};

Path.prototype.setNewDirection = function(dir) {
  var possibles = this.possibleDirs();
  if (!possibles.length) return this.dir = null;
  var last = this.points.last;
  this.dir = dir || choose1(possibles);
  this.grid.cells[last.x+this.dir.x][last.y+this.dir.y] = true;
};

Path.prototype.update = function() {
  if (this.dead) return;
  
  this.points.push(pt.add(this.points.last, this.dir));
  this.setNewDirection();
};

Path.prototype.draw = function(t) {
  var grid = this.grid;  
  var p = grid.translate(this.points[0])
  ctx.moveTo(p.x, p.y);
  for (var i = 1; i < this.points.length; i++) {
    p = grid.translate(this.points[i]);
    ctx.lineTo(p.x, p.y);
  }
  
  if (this.dead) return;
  
  var size = this.grid.size;
  var dir = this.dir;

  p = pt.add(p, pt(dir.x*t*size, dir.y*t*size));
  
  ctx.lineTo(p.x, p.y);
};

Object.defineProperty(Path.prototype, 'dead', {
  get: function() { return !this.dir; }
});

function Grid(x, y, w, h, size) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.xOffset = x + size/2;
  this.yOffset = y + size/2;
  this.size = size;
  this.cells = new Array(w);
  for (var i = 0; i < w; i++) {
    this.cells[i] = new Array(h);
    for (var j = 0; j < h; j++) {
      this.cells[i][j] = false;
    }
  }

  this.paths = [];
  for (var i = 0 ; i < this.w; i++) {
    this.paths[i] = new Path(this, pt(~~r(this.w), ~~r(this.h)));
  }
}

Grid.prototype.translate = function(p) {
  var size = this.size;
  return pt(this.xOffset + p.x*size, this.yOffset + p.y*size);
}

Grid.prototype.freeCell = function() {
  var x, y;
  do {
    x = ~~r(this.w);
    y = ~~r(this.h);
  } while (this.cells[x][y] === true);
  return pt(x, y);
};

Grid.prototype.update = function() {
  this.paths.forEach(function(growth) { growth.update(); });
  ctx.stroke();
};

Grid.prototype.draw = function(t) {
  ctx.beginPath();
  this.paths.forEach(function(growth) { growth.draw(t); });
  ctx.stroke();
};

Object.defineProperty(Grid.prototype, 'dead', {
  get: function() {
    return this.paths.every(function(g) { return g.dead; });
  }
});

/*---------------------------------------------------------------------------*/

var STEP = 24;
var w = 3;
var h = 3;
var sz = dpr(10);
var lw = dpr(4);
var dim = 5;
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
                         dim, dim, sz);
     grids.push(grid);
   } 
  }
  
  ctx.strokeStyle = 'rgb(241, 241, 242)';
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

function clearBackground(color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function drawGridBackgrounds() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  grids.forEach(function(grid) {
    ctx.fillRect(grid.x, grid.y, grid.w*grid.size, grid.h*grid.size);
  })
}

function draw() {
  clearBackground('rgb(57, 55, 77)');
  
  if (time && time % STEP === 0) {
    grids.forEach(function(g) { g.update(); });
  }
  var t = time % STEP / STEP;
  grids.forEach(function(g) { g.draw(t); });
  if (grids.every(function(g) { return g.dead; })) {
    pause();
    setTimeout(reset, 1500);
  }
}

/*---------------------------------------------------------------------------*/

document.onclick = pause;
window.ondblclick = reset;
window.onresize = reset;

reset();