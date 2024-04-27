// Set up our canvas
var canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);
var ctx = canvas.getContext('2d');

// Pick out the form elements for easy access later
var x1 = document.querySelector('#x1');
var x2 = document.querySelector('#x2');
var y = document.querySelector('#y');
var factor = document.querySelector('#factor');

var color = document.querySelector('#color');

// Animation function
function draw(){
  // clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Wobble the cube using a sine wave
  var wobble = Math.sin(Date.now()/250)*window.innerHeight/50;
  
  // draw the cube
  drawCube(
    window.innerWidth/2,
    window.innerHeight/2 + wobble + y.value/2,
    Number(x1.value),
    Number(x2.value),
    Number(y.value),
    color.value,
    Number(factor.value)/100
  );
  
  requestAnimationFrame(draw);
}
draw();

// Colour adjustment function
// Nicked from http://stackoverflow.com/questions/5560248
function shadeColor(color, percent) {
  color = color.substr(1);
  var num = parseInt(color, 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    G = (num >> 8 & 0x00FF) + amt,
    B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

// Draw a cube to the specified specs
function drawCube(x, y, wx, wy, h, color,factor) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - wx, y);
    ctx.lineTo(x - wx, y - h);
    ctx.lineTo(x, y - h * 1);
    ctx.closePath();
    ctx.fillStyle = shadeColor(color, -10);
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + wy/2, y - wy/2 * factor);
    ctx.lineTo(x + wy/2, y - h - wy/2 * factor);
    ctx.lineTo(x, y - h * 1);
    ctx.closePath();
    ctx.fillStyle = shadeColor(color, 10);
    ctx.strokeStyle = shadeColor(color, 50);
    ctx.stroke();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x, y - h);
    ctx.lineTo(x - wx, y - h );
    ctx.lineTo(x - wx + wy/2, y - h - (wy/2 * factor));
    ctx.lineTo(x + wy/2, y - h - wy/2 * factor);
    ctx.closePath();
    ctx.fillStyle = shadeColor(color, 20);
    ctx.strokeStyle = shadeColor(color, 60);
    ctx.stroke();
    ctx.fill();
  }