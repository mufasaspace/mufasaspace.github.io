const PX = 600;
const CELLS = 10;
const ITERATIONS = 69;
const COLOR = [241, 241, 242];

const { PI, floor, random } = Math;
const PX_PER_CELL = PX / CELLS;

const canvas = document.createElement('canvas');
canvas.height = canvas.width = PX;
canvas.style.height = canvas.style.width = `${PX / 2}px`;
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');
ctx.lineWidth = 10;

function go() {
  ctx.clearRect(0, 0, PX, PX);
  for (let n = 0; n < ITERATIONS; n++) {
    // Pick a random direction from [up, down, left, right].
    let dir = getDir(rand(2) ? 'x' : 'y');

    // Set the position so that the lines come out of the appropriate
    // wall (based on direction), in a random cell.
    let pos = dir.x ?
    { x: (-dir.x + 1) / 2 * (CELLS + 1) - 1, y: rand(CELLS) } :
    { x: rand(CELLS), y: (-dir.y + 1) / 2 * (CELLS + 1) - 1 };


    let opacity = 1;
    do {
      ctx.strokeStyle = `rgba(${COLOR}, ${opacity})`;
      opacity -= 0.1;

      // Draw a line straight ahead.
      ctx.beginPath();
      ctx.moveTo(px(pos.x), px(pos.y));
      pos.x += dir.x;
      pos.y += dir.y;
      ctx.lineTo(px(pos.x), px(pos.y));
      ctx.stroke();

      // Once in a while, turn 90 degrees.
      if (!rand(5)) {
        let oldAxis = dir.x ? 'x' : 'y';
        let oldSign = dir[oldAxis];
        let newAxis = oldAxis === 'y' ? 'x' : 'y';
        dir = getDir(newAxis);

        let a1;
        switch (oldSign - dir[newAxis]) {
          case -2:
            a1 = 2;
            break;
          case 2:
            a1 = 0;
            break;
          case 0:
            a1 = 1 + (oldAxis === 'x' === (oldSign === 1)) * 2;}


        pos.x += dir.x;
        pos.y += dir.y;

        ctx.strokeStyle = `rgba(${COLOR}, ${opacity})`;
        opacity -= 0.1;
        ctx.beginPath();
        ctx.arc(
        px(pos.x),
        px(pos.y),
        PX_PER_CELL,
        a1 * PI / 2,
        (a1 + 1) * PI / 2);

        ctx.stroke();

        pos[oldAxis] += oldSign;
      }
    } while (pos.x >= 0 && pos.y >= 0 && pos.x < CELLS && pos.y < CELLS);
  }
}

canvas.addEventListener('click', go, false);
go();

// Utils.
function px(cell) {
  return (cell + 0.5) * PX_PER_CELL;
}

function getDir(axis) {
  return axis === 'x' ?
  { x: rand(2) * 2 - 1, y: 0 } :
  { x: 0, y: rand(2) * 2 - 1 };

}

function rand(a, b, c) {
  const fn = b === 'true' || c ? i => i : floor;
  if (typeof b !== 'number') {b = a;a = 0;}
  return fn(random() * (b - a) + a);
}