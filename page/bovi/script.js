function prop(min, max) {
  var rand = Math.floor(Math.random() * (max - min + 1)) + min;
  return rand = rand+"%";
}

function spawnSphere() {
  var top = prop(30, 70);
  var left = prop(30, 70);
  console.log(top, left);
  var $sphere = '<div class="sphere"></div>';
  $("body").append( $sphere ).find(".sphere:last").animate({
    top: top,
    left: left,
    opacity: 0
  }, 4000, function(){
    $("body").find(".sphere:first").remove();
  });
}
setInterval("spawnSphere()", 500);