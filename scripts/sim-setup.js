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

if (title === 'Matter.js Demo') {
    // Define robots on the field
    let one = new DualBot('blue', -75, 130, fieldWidth, fieldHeight),
        two = new TriBot('blue', 75, 130, fieldWidth, fieldHeight),
        three = new UniBot('yellow', -75, 130, fieldWidth, fieldHeight);

    let robots = [one, two, three];
    window.One = one;
    window.Two = two;
    window.Three = three;
    window.Ball = ball;
    // Create a new simulation if selected
    window.Example = window.Example || {};
    window.Example.soccer = function() {
        var sim = new SoccerSim(document.body, robots, ball);
        return sim.demo();
    };
} else {
    // Real interface
    // Define robots on the field
    let blue1 = new DualBot('blue', -75, 130, fieldWidth, fieldHeight);
    let blue2 = new DualBot('blue', 75, 130, fieldWidth, fieldHeight);
    // TODO: Pass these into simcontrols, rather than using window
    window.One = blue1;
    window.Two = blue2;
    window.Ball = ball;
    let robots = [blue1, blue2];
    var sim = new SoccerSim(document.getElementById('matterjs'), robots, ball, fieldWidth, fieldHeight);
    // Engine.run(sim.engine);
    // Render.run(sim.render);
}