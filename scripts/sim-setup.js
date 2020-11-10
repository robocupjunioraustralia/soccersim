"use strict";

// Matter-js libraries
var Bodies = Matter.Bodies,
    fieldWidth = 546,
    fieldHeight = 729;

let title = document.getElementsByTagName("title")[0].innerHTML;

// define the ball
let ball = Bodies.circle(fieldWidth/2, fieldHeight/2, 10, {
    frictionAir: 0.02,
    render: {fillStyle: '#f95a00'}
});

// Define robots on the field
let blue1 = new DualBot('blue', -75, 130, fieldWidth, fieldHeight);
let blue2 = new DualBot('blue', 75, 130, fieldWidth, fieldHeight);
let robots = [blue1, blue2];
robotControls.setRobots(robots)
robotControls.setBall(ball)
var sim = new SoccerSim(document.getElementById('matterjs'), robots, ball, fieldWidth, fieldHeight);
// Engine.run(sim.engine);
// Render.run(sim.render);