// Utilities
function rad(deg) {
  return deg * Math.PI / 180;
}
function pos(x, y, r, deg) {
  return {
    x: (x - r * Math.sin(rad(deg))).toString(),
    y: (y - r * Math.cos(rad(deg))).toString()
  };
}
function stringPos(obj) {
  return obj.x + "," + obj.y;
}

var c = Snap("#clock");
var face = c.circle(256, 256, 256).addClass("f1");

// Circles
c
  .circle(256, 256, 112)
  .attr({ fill: "none", strokeWidth: 4 })
  .addClass("s2");
c
  .circle(256, 256, 192)
  .attr({ fill: "none", strokeWidth: 4 })
  .addClass("s2");

// Triangle
var tri = c
  .path()
  .addClass("f2 s2")
  .attr({ strokeWidth: 80, strokeLinejoin: "round" });

// Hands
var displayStyle = { fontSize: 40, textAnchor: "middle", fontWeight: "bold" };
var handS = c.g(
  c.circle(0, 0, 32).addClass("f1"),
  c
    .text(0, 14, "00")
    .attr(displayStyle)
    .addClass("f2 displayS")
);
var handM = c.g(
  c.circle(0, 0, 32).addClass("f1"),
  c
    .text(0, 14, "00")
    .attr(displayStyle)
    .addClass("f2 displayM")
);

var handH = c.g(
  c.circle(0, 0, 32).addClass("f1"),
  c
    .text(0, 14, "00")
    .attr(displayStyle)
    .addClass("f2 displayH")
);
handH.transform("t256,256");

// Time Displays
function updateTimes(s, m, h) {
  var i,
    elS = document.getElementsByClassName("displayS"),
    elM = document.getElementsByClassName("displayM"),
    elH = document.getElementsByClassName("displayH");

  function pad(num) {
    var str = num.toString();
    return str.length > 1 ? str : "0" + str;
  }

  for (i = 0; i < elS.length; i++) {
    elS[i].innerHTML = pad(s);
  }
  for (i = 0; i < elM.length; i++) {
    elM[i].innerHTML = pad(m);
  }
  for (i = 0; i < elH.length; i++) {
    elH[i].innerHTML = pad(h);
  }
}

// Drawing
var delta,
  lastSecond,
  last = new Date();
function draw() {
  var now = new Date();
  delta = (now.getTime() - last.getTime()) / 1000;
  last = now;

  var h = now.getHours();
  var m = now.getMinutes();
  var s = now.getSeconds();
  var ms = now.getMilliseconds();

  // Progress
  var prog = { ms: ms / 1000 };
  prog.s = (s + prog.ms) / 60;
  prog.m = (m + prog.s) / 60;
  prog.h = (h + prog.m) / 12;

  // Hand Positions
  var p1 = stringPos(pos(256, 256, 192, prog.s * -360));
  var p2 = stringPos(pos(256, 256, 112, prog.m * -360));
  var p3 = stringPos(pos(256, 256, 0, prog.h * -360));

  // Move Hands
  handS.transform("t" + p1);
  handM.transform("t" + p2);
  // handH.transform('t'+p3);

  // Move Triangle
  var triPoints = "M" + p1 + "L" + p2 + "L" + p3 + "Z";
  tri.attr("d", triPoints);

  // Update Displays
  if (s !== lastSecond) {
    updateTimes(s, m, h);
  }
  lastSecond = s;

  window.requestAnimationFrame(draw);
}

draw();