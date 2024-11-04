function setup() {
  createCanvas(800, 600);
}

function draw() {
  background(16);
  if (mouseIsPressed === true) {
    fill(0);
  } else {
    fill(255);
  }


  circle(mouseX, mouseY, 100);
}
}
