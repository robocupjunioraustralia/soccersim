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
let blue1Orig = new DualBot('blue', -50, 125, fieldWidth, fieldHeight);
let blue2Orig = new DualBot('blue', 50, 125, fieldWidth, fieldHeight);


// Change rawAngle into bearing
function calcBearing(angle, compensate) {
    // Add Math.PI to compensate for blue team facing opposite direction
    let bearing = compensate ? angle % (2*Math.PI) + Math.PI : angle % (2*Math.PI);
    // Wrap between -180 and 180 deg
    bearing = (bearing + 2*Math.PI) % (2*Math.PI);
    if (bearing > Math.PI) {
        bearing -= 2*Math.PI;
    }
    return bearing*180/Math.PI;
}

// Make motor speeds look better
function formatMotorSpeeds(numArray) {
    let text = '';
    numArray.forEach((element, index) => {
        index != 0 ? text += `, ${element}` : text += `${element}`; 
    });
    return text;
}

// Initial setup of display
document.getElementById('blue1_motorSpeeds').textContent = formatMotorSpeeds(blue1Orig.motorSpeeds);
document.getElementById('blue1_prevAngle').textContent = blue1Orig.prevAngle;
const blue1BallPos = blue1Orig.getBallPosition(ball)
document.getElementById('blue1_ballDistance').textContent = blue1BallPos.distance;
document.getElementById('blue1_ballAngle').textContent = blue1BallPos.angle;

document.getElementById('blue2_motorSpeeds').textContent = formatMotorSpeeds(blue2Orig.motorSpeeds);
document.getElementById('blue2_prevAngle').textContent = blue2Orig.prevAngle;
const blue2BallPos = blue2Orig.getBallPosition(ball)
document.getElementById('blue2_ballDistance').textContent = blue2BallPos.distance;
document.getElementById('blue2_ballAngle').textContent = blue2BallPos.angle;

// Proxies to catch state changes
const blue1 = new Proxy(blue1Orig, {
    set: function(target, key, value) {
        switch (key) {
            case 'motorSpeeds':
                document.getElementById('blue1_motorSpeeds').textContent = formatMotorSpeeds(value.map((element) => element * 500));
                break;
            case 'prevAngle':
                document.getElementById('blue1_prevAngle').textContent = calcBearing(value, true).toFixed(1);
                break;
            case 'pos':
                const blue1BallPos = blue1Orig.getBallPosition(ball)
                document.getElementById('blue1_ballDistance').textContent = blue1BallPos.distance.toFixed(1);
                document.getElementById('blue1_ballAngle').textContent = calcBearing(blue1BallPos.angle, false).toFixed(1);
                break;
            default:
                break;
        }
        return Reflect.set(...arguments);
    }
});

const blue2 = new Proxy(blue2Orig, {
    set: function(target, key, value) {
        switch (key) {
            case 'motorSpeeds':
                document.getElementById('blue2_motorSpeeds').textContent = formatMotorSpeeds(value.map((element) => element * 500));
                break;
            case 'prevAngle':
                document.getElementById('blue2_prevAngle').textContent = calcBearing(value, true).toFixed(1);
                break;
            case 'pos':
                const blue2BallPos = blue2Orig.getBallPosition(ball)
                document.getElementById('blue2_ballDistance').textContent = blue2BallPos.distance.toFixed(1);
                document.getElementById('blue2_ballAngle').textContent = calcBearing(blue2BallPos.angle, false).toFixed(1);
                break;
            default:
                break;
        }
        return Reflect.set(...arguments);
    }
});

let robots = [blue1, blue2];
robotControls.setRobots(robots);
robotControls.setBall(ball);
var sim = new SoccerSim(document.getElementById('matterjs'), robots, ball, fieldWidth, fieldHeight);
const rulers = new Rulers(
    {
        'ruler-vertical': document.getElementById('ruler-vertical'),
        'ruler-horizontal': document.getElementById('ruler-horizontal'),
    }
);
// Engine.run(sim.engine);
// Render.run(sim.render);