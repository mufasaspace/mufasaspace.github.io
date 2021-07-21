var SEED = 80;
var DIRECTIONS = [[0, 1], [1, 0]];
var COLUMNS = 10;
var ROWS = 10;
var SQUARE_SIZE = 12;

var swatches = ['#585481', '#39374D', '#202020'];

function setup() {
	noStroke();
	createCanvas(COLUMNS * 27 + SQUARE_SIZE, ROWS * 27 + SQUARE_SIZE);
	translate(SQUARE_SIZE / 2, SQUARE_SIZE / 2)
	frameRate(1); // generate new graphic each second
}

function link(c1, r1, offset1, offset2) {
	fill(swatches[Math.floor(random(swatches.length))]);
	rect(coordinate(c1, r1)[0] - SQUARE_SIZE / 2, coordinate(c1, r1)[1] - SQUARE_SIZE / 2, coordinate(offset1, offset2)[0] + SQUARE_SIZE, coordinate(offset1, offset2)[1] + SQUARE_SIZE);
}

function coordinate(c, r) { // Convert (columns, row) to (x, y)
	var position = [ c * 30, r * 30 ];
	return position
}

function draw() {
	
	background(241,241,242);

	for ( var i = 0; i < COLUMNS; i ++) {
		for ( var j = 0; j < ROWS; j ++) {
			fill(swatches[Math.floor(random(swatches.length))]);
			rect( i * 30 - SQUARE_SIZE / 2, j * 30 - SQUARE_SIZE / 2, SQUARE_SIZE, SQUARE_SIZE);
		}
	}

	for ( var i = 0; i < SEED; i ++) {
		var start = [ Math.floor(random(COLUMNS - 1)), Math.floor(random(ROWS - 1)) ];
		var offset;
		offset = DIRECTIONS[ Math.floor(random(2)) ];
		link(start[0], start[1], offset[0], offset[1] );
	}
}