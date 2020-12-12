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
        codes: ['','','',''],
        goalDetected: false,
        loc: {
            LEFT: 1,
            CENTRE: 2,
            RIGHT: 3
        },
        timerInterval: null,
        timeLeft: 5 * 60,
        kickingOff: 'yellow',
        kickOffBot: {
            blue: 0,
            yellow: 3
        }
    };

    let blueScore = document.getElementById("blue-score");
    let yellowScore = document.getElementById("yellow-score");

    competition.updateMainUIScores = function() {
        blueScore.textContent = competition.scores.blue;
        yellowScore.textContent = competition.scores.yellow;
    };
    competition.updateMainUIScores();
    
    let blueModalScore = document.getElementById("blue-modal-score");
    let yellowModalScore = document.getElementById("yellow-modal-score");

    let scoringSetup = document.getElementById('scoring-setup');
    scoringSetup.addEventListener('click', function() {
        competition.tempScores.blue = competition.scores.blue;
        competition.tempScores.yellow = competition.scores.yellow;

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

    let coinFlipButton = document.getElementById('coin-flip');
    coinFlipButton.addEventListener('click', function() {
        if (Math.random() >= 0.5) {
            competition.kickingOff = 'yellow';
            document.getElementById('coin-flip-results').textContent = 'Yellow kicking off';
        } else {
            competition.kickingOff = 'blue';
            document.getElementById('coin-flip-results').textContent = 'Blue kicking off';
        }
        competition.setKickOff(competition.kickingOff);
        competition.scores.blue = competition.tempScores.blue;
        competition.scores.yellow = competition.tempScores.yellow;

        competition.updateMainUIScores();
    });

    // Kickoff robot setup
    let blueKickoffSelect = document.getElementById('blue-kickoff-robot');
    scoringSave.addEventListener('change', function() {
        competition.kickOffBot.blue = parseInt(this.value);
    });
    let yellowKickoffSelect = document.getElementById('yellow-kickoff-robot');
    scoringSave.addEventListener('change', function() {
        competition.kickOffBot.yellow = parseInt(this.value);
    });

    competition.setKickOff = function(team) {
        for (let robot of robots) {
            robot.kicking = false;
        }
        if (team === 'blue') {
            competition.robots[competition.kickOffBot.blue].kicking = true;
        } else if (team === 'yellow') {
            competition.robots[competition.kickOffBot.yellow].kicking = true;
        }
    };

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

    function decreaseTimer() {
        competition.timeLeft = competition.timeLeft - 0.25;
        let minutes = Math.floor(competition.timeLeft / 60).toString().padStart(2, '0');
        let seconds = (Math.floor(competition.timeLeft) % 60).toString().padStart(2, '0');

        if (competition.timeLeft <= 0) {
            competition.stopSim();
            competition.goalDetected = true;
            document.getElementById('timer').textContent = 'GAME OVER';
        } else {
            document.getElementById('timer').textContent = minutes + ':' + seconds;
        }
    }

    // Start simulator
    competition.startSim = function() {
        competition.moveBall(competition.loc.CENTRE, ball);
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
        competition.goalDetected = false;

        // UI stuff
        document.getElementById('level').classList.remove('yellow-goal');
        document.getElementById('level').classList.remove('blue-goal');

        // restart the round
        competition.timerInterval = setInterval(decreaseTimer, 250);
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
        clearInterval(competition.timerInterval);
    };

    // Handle goal detection (stop simulator automatically)
    competition.handleGoalDetection = function(team) {
        // Goal!
        if (competition.goalDetected) return;
        competition.goalDetected = true;
        if (team === 'yellow') {
            competition.scores.yellow++;
            document.getElementById('level').classList.add('yellow-goal');
            competition.setKickOff('blue');
        }
        else if (team === 'blue') {
            competition.scores.blue++;
            document.getElementById('level').classList.add('blue-goal');
            competition.setKickOff('yellow');
        }
        document.getElementById('timer').textContent = 'GOAL!';
        competition.updateMainUIScores();
        competition.stopSim();
        setTimeout(competition.startSim, 1000);
    };

    competition.moveBall = function(location, ball) {
        switch (location) {
            case competition.loc.CENTRE: Matter.Body.setPosition(ball, {x: fieldWidth/2, y: fieldHeight/2}); break;
            case competition.loc.LEFT:   Matter.Body.setPosition(ball, {x: 0.33*fieldWidth, y: fieldHeight/2}); break;
            case competition.loc.RIGHT:  Matter.Body.setPosition(ball, {x: 0.66*fieldWidth, y: fieldHeight/2}); break;
        }
        Matter.Body.applyForce(ball, ball.position, {x: 0, y: 0});
        Matter.Body.setVelocity(ball, {x: 0, y: 0});

    };

    document.addEventListener('keydown', function(event) {
        // keycode 49 is 1
        if (event.keyCode >= 49 && event.keyCode <= 51) {
            competition.moveBall(event.keyCode - 48, ball);
        }
    });

    sim.detectGoals(competition.handleGoalDetection);
        
    window.competition = competition;

})();
