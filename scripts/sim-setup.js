"use strict";

// Matter-js libraries
var Bodies = Matter.Bodies,
    fieldWidth = 546,
    fieldHeight = 729;

let title = document.getElementsByTagName("title")[0].innerHTML;

// Define robots on the field
let one = new DualBot('blue',-75, 130, fieldWidth, fieldHeight),
two = new TriBot('blue',75, 130, fieldWidth, fieldHeight),
three = new UniBot('yellow',-75,130, fieldWidth, fieldHeight);

let robots = [one, two, three];
window.One = one;
window.Two = two;
window.Three = three;

// define the ball
let ball = Bodies.circle(fieldWidth/2, fieldHeight/2, 10, {
    frictionAir: 0.02,
    render: {fillStyle: '#f95a00'}
});
window.Ball = ball;

if (title === 'Matter.js Demo') {
    // Create a new simulation if selected
    window.Example = window.Example || {};
    window.Example.soccer = function() {
        var sim = new SoccerSim(document.body, robots, ball);
        return sim.demo();
    };
} else {
    // Assume it is the actual interface
    // Create a new simulation
    var sim = new SoccerSim(document.getElementById('matterjs'), robots, ball, fieldWidth, fieldHeight);
    // Engine.run(sim.engine);
    // Render.run(sim.render);
}