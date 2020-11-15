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
robotControls.setRobots(robots);
robotControls.setBall(ball);
var sim = new SoccerSim(document.getElementById('matterjs'), robots, ball, fieldWidth, fieldHeight);
blue1.setPos(-50, 125);
blue2.setPos(50, 125);
// Engine.run(sim.engine);
// Render.run(sim.render);



// Modals

function getAll(selector) {
    var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

    return Array.prototype.slice.call(parent.querySelectorAll(selector), 0);
}


var rootEl = document.documentElement;
var $modals = getAll('.modal');
var $modalButtons = getAll('.modal-button');
var $modalCloses = getAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button');

if (!localStorage.getItem('soccersim-shownchanges')) {
    localStorage.setItem('soccersim-shownchanges', true);
    openModal('notification-modal');
}

if ($modalButtons.length > 0) {
    $modalButtons.forEach(function ($el) {
        $el.addEventListener('click', function () {
            var target = $el.dataset.target;
            openModal(target);
        });
    });
}

if ($modalCloses.length > 0) {
    $modalCloses.forEach(function ($el) {
        $el.addEventListener('click', function () {
            closeModals();
        });
    });
}

function openModal(target) {
    var $target = document.getElementById(target);
    rootEl.classList.add('is-clipped');
    $target.classList.add('is-active');
}

function closeModals() {
    rootEl.classList.remove('is-clipped');
    $modals.forEach(function ($el) {
        $el.classList.remove('is-active');
    });
}

document.addEventListener('keydown', function (event) {
    var e = event || window.event;
    if (e.keyCode === 27) {
        closeModals();
    }
});