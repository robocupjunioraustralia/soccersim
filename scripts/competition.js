// Set up robots
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
let yellow1 = new DualBot('yellow', -75, 130, fieldWidth, fieldHeight);
let yellow2 = new DualBot('yellow', 75, 130, fieldWidth, fieldHeight);
let robots = [blue1, blue2, yellow1, yellow2];
robotControls.setRobots(robots);
robotControls.setBall(ball);
var sim = new SoccerSim(document.getElementById('matterjs'), robots, ball, fieldWidth, fieldHeight);
blue1.setPos(-50, 125);
blue2.setPos(50, 125);
yellow1.setPos(-50, 125);
yellow2.setPos(50, 125);

sim.render.canvas.height = 546;
sim.render.canvas.width = 729;

// Matter.Composite.rotate(sim.world, 90 * Math.PI/180, Matter..create(sim.fieldWidth/2, sim.fieldHeight/2));
Matter.Events.on(sim.runner, "afterUpdate", () => {
    // Rotate the canvas context and fit it in the correct box
    sim.render.context.translate(sim.render.context.canvas.width * 0.5, sim.render.context.canvas.height * 0.5);
    sim.render.context.rotate(Math.PI * 0.5);
    sim.render.context.translate(-sim.render.context.canvas.width * 0.5, -sim.render.context.canvas.height * 0.5);
    sim.render.context.translate(91.5, -91.5);
});

// Override mouse position such that it works with a rotated canvas context
Matter.Mouse._getRelativeMousePosition = function(event, element, pixelRatio) {
    var elementBounds = element.getBoundingClientRect(),
    rootNode = (document.documentElement || document.body.parentNode || document.body),
    scrollX = (window.pageXOffset !== undefined) ? window.pageXOffset : rootNode.scrollLeft,
    scrollY = (window.pageYOffset !== undefined) ? window.pageYOffset : rootNode.scrollTop,
    touches = event.changedTouches,
    x, y;

    if (touches) {
        x = touches[0].pageX - elementBounds.left - scrollY;
        y = touches[0].pageY - elementBounds.top - scrollX;
    } else {
        x = event.pageX - elementBounds.left - scrollY;
        y = event.pageY - elementBounds.top - scrollX;
    }
    let res = {
        x: (y / (element.clientHeight / (element.height || element.clientHeight) * pixelRatio))/546 * 729,
        y: (729 - x / (element.clientWidth / (element.width || element.clientWidth) * pixelRatio))/729 * 546
    };
    return res;
};

;(function() {
    "use strict";

    let competition = {
        scores: {
            yellow: 0,
            blue: 0
        },
        tempScores: {
            yellow: 0,
            blue: 0
        },
        robots: [blue1, blue2, yellow1, yellow2],
        codes: ['','','','']
    };

    let blueScore = document.getElementById("blue-score");
    let yellowScore = document.getElementById("yellow-score");

    competition.updateMainUIScores = function() {
        blueScore.textContent = competition.scores.blue;
        yellowScore.textContent = competition.scores.yellow;
    };
    
    let blueModalScore = document.getElementById("blue-modal-score");
    let yellowModalScore = document.getElementById("yellow-modal-score");

    let scoringSetup = document.getElementById('scoring-setup');
    scoringSetup.addEventListener('click', function() {
        competition.tempScores.blue = competition.scores.blue;
        competition.tempScores.yellow = competition.scores.yellow;

        competition.updateMainUIScores();
        blueModalScore.textContent = competition.scores.blue;
        yellowModalScore.textContent = competition.scores.yellow;
    });
    
    let blueReset = document.getElementById("blue-reset");
    blueReset.addEventListener('click', function() {
        competition.tempScores.blue = 0;
        blueModalScore.textContent = competition.tempScores.blue;
    });

    let yellowReset = document.getElementById("yellow-reset");
    yellowReset.addEventListener('click', function() {
        competition.tempScores.yellow = 0;
        yellowModalScore.textContent = competition.tempScores.yellow;
    });

    let bluePlus = document.getElementById("blue-plus");
    bluePlus.addEventListener('click', function() {
        competition.tempScores.blue++;
        blueModalScore.textContent = competition.tempScores.blue;
    });

    let yellowPlus = document.getElementById("yellow-plus");
    yellowPlus.addEventListener('click', function() {
        competition.tempScores.yellow++;
        yellowModalScore.textContent = competition.tempScores.yellow;
    });

    let blueMinus = document.getElementById("blue-minus");
    blueMinus.addEventListener('click', function() {
        competition.tempScores.blue--;
        blueModalScore.textContent = competition.tempScores.blue;
    });

    let yellowMinus = document.getElementById("yellow-minus");
    yellowMinus.addEventListener('click', function() {
        competition.tempScores.yellow--;
        yellowModalScore.textContent = competition.tempScores.yellow;
    });

    let scoringSave = document.getElementById('scoring-save');
    scoringSave.addEventListener('click', function() {
        competition.scores.blue = competition.tempScores.blue;
        competition.scores.yellow = competition.tempScores.yellow;

        competition.updateMainUIScores();
    });

    competition.updateBlueTeamDetails = function() {
        let newBlueTeamName = document.getElementById('blue-team-name').value;
        document.getElementById('blue-team').textContent = newBlueTeamName;
        document.getElementById('blue-team-name-modal').textContent = newBlueTeamName;
    };

    let blueName= document.getElementById('blue-set-team-name');
    blueName.addEventListener('click', function() {
        competition.updateBlueTeamDetails();
    });

    competition.updateYellowTeamDetails = function() {
        let newYellowTeamName = document.getElementById('yellow-team-name').value;
        document.getElementById('yellow-team').textContent = newYellowTeamName;
        document.getElementById('yellow-team-name-modal').textContent = newYellowTeamName;
    };

    let yellowName = document.getElementById('yellow-set-team-name');
    yellowName.addEventListener('click', function() {
        competition.updateYellowTeamDetails();
    });

    // Handle loading of robot codes
    competition.uploadFile = function (files, codeId) {
        if (files.length !== 1) {
            return;
        }
        let file = files[0];
        if (file) {
            let reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function (evt) {
                let js = evt.target.result;
                competition.codes[codeId] = js;
            };
        }
    };

    document.querySelectorAll(".file-input").forEach(function(el) {
        el.addEventListener("change", (e) => {
            console.log(e.target.getAttribute('name'));
            let codeId = 4;
            switch(e.target.getAttribute('name')) {
                case 'blue1':   codeId = 0; break;
                case 'blue2':   codeId = 1; break;
                case 'yellow1': codeId = 2; break;
                case 'yellow2': codeId = 3; break;
            }
            if (codeId == 4) return;
            competition.uploadFile(e.target.files, codeId);
        }, false);
    });

    // Start simulator
    competition.startSim = function() {
        document.getElementById('notifications').innerHTML = '';
        let runButton = document.getElementById('run-robots');
        let stopButton = document.getElementById('stop-robots');

        if (runButton.getAttribute('disabled') === '') {
            return;
        }

        runButton.classList.add('is-loading');
        runButton.setAttribute('disabled', '');
        stopButton.removeAttribute('disabled');

        runButton.classList.remove('is-loading');
        intptr.startSim(competition.robots, competition.codes, robotControls.ball);
    };

    competition.stopSim = function() {
        let runButton = document.getElementById('run-robots');
        let stopButton = document.getElementById('stop-robots');

        if (stopButton.getAttribute('disabled') === '') {
            return;
        }

        stopButton.setAttribute('disabled', '');
        runButton.removeAttribute('disabled');
        intptr.stopSim();
    };
        
    window.competition = competition;

})();
