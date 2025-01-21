function setup() {
  createCanvas(800, 600);
}

function draw() {
  background(135, 206, 235);
  fill("yellow"); //yellow  

  stroke("orange"); //orange outline 

  strokeWeight(20); //large outline 

  circle(550, 50, 100);

  stroke(0);//black outline

  strokeWeight(1);//outline thickness

  fill("green");

  rect(0, 200, 600, 400);

  textSize(75)
  text("⛰", 100, 250) //flower
  text("🐞", 300, 250)
  text("🦄", mouseX, mouseY, 250)
}
