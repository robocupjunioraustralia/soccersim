/**
 * @description Interpreter to run user submitted code and act as an API between
 * Blockly and the matter-js environment.
 */
;(function() {

    var motorFunctions = [
        'setMotorSpeed',
        'stopMotor',
        'getMotorSpeed',
        'getBallAngle',
        'getBallDistance',
        'getCompassHeading',
        'setInitialPosition'
    ];

    const defencePositions = [
        'far-left',
        'left',
        'centre',
        'right',
        'far-right'
    ];

    const kickerPositions = [
        ...defencePositions,
        'forward',
        'mid-forward'
    ];

    const positionMap = {
        'far-left':    {x: -100, y: 125},
        'left':        {x:  -50, y: 125},
        'centre':      {x:    0, y: 125},
        'right':       {x:   50, y: 125},
        'far-right':   {x:  100, y: 125},
        'forward':     {x:    0, y: 300},
        'mid-forward': {x:    0, y: 250}
    };

    console.log(defencePositions, kickerPositions);

    class RobotFunctions {
        constructor(robot, ball, id) {
            this.robot = robot;
            this.ball = ball;
            this.id = id;
            this.speeds = [0, 0, 0];
        }
        setMotorSpeed(motor, speed) {
            if (typeof speed !== 'number') return;
            if (speed > 100) speed = 100;
            if (speed < -100) speed = -100;
            switch (motor) {
                case 'motorA':
                    this.robot.setMotorSpeed(0, speed / 500);
                    this.speeds[0] = speed;
                    break;
                case 'motorB':
                    this.robot.setMotorSpeed(1, speed / 500);
                    this.speeds[1] = speed;
                    break;
                case 'motorC':
                    this.robot.setMotorSpeed(2, speed / 500);
                    this.speeds[2] = speed;
                    break;
                default:
                    break;
            }
        }
        stopMotor(motor) {
            switch (motor) {
                case 'motorA':
                    this.robot.setMotorSpeed(0, 0);
                    this.speeds[0] = 0;
                    break;
                case 'motorB':
                    this.robot.setMotorSpeed(1, 0);
                    this.speeds[1] = 0;
                    break;
                case 'motorC':
                    this.robot.setMotorSpeed(2, 0);
                    this.speeds[2] = 0;
                    break;
                default:
                    break;
            }
        }
        getMotorSpeed(motor) {
            switch (motor) {
                case 'motorA':
                    return this.speeds[0];
                case 'motorB':
                    return this.speeds[1];
                case 'motorC':
                    return this.speeds[2];
                default:
                    return 0;
            }
        }
        getBallAngle() {
            return this.robot.getBallPosition(this.ball).angle*180/Math.PI;
        }
        getBallDistance() {
            return this.robot.getBallPosition(this.ball).distance;
        }
        getCompassHeading() {
            return this.robot.getBearing()*180/Math.PI;
        }
        setInitialPosition(position) {}
        setKickerPosition(position) {}
    }

    // DummyRobotFunctions is used to set the initial and kicker positions.
    class DummyRobotFunctions extends RobotFunctions {
        constructor(robot, ball, id) {
            super(robot, ball, id);
            if (this.id % 2 == 0) { // left robot
                this.robot.setPos(positionMap.left.x, positionMap.left.y);
            } else {
                this.robot.setPos(positionMap.right.x, positionMap.right.y);
            }
        }
        setMotorSpeed(motor, speed) {}
        stopMotor(motor) {}
        getMotorSpeed(motor) {}
        getBallAngle() {
            return 0;
        }
        getBallDistance() {
            return 0;
        }
        getCompassHeading() {
            return 0;
        }
        setInitialPosition(position) {
            if (!defencePositions.includes(position) || position === 'default') {
                if (this.id % 2 == 0) { // left robot
                    this.robot.setPos(positionMap.left.x, positionMap.left.y);
                } else {
                    this.robot.setPos(positionMap.right.x, positionMap.right.y);
                }
            } else {
                this.robot.setPos(positionMap[position].x, positionMap[position].y);
            }
        }
        setKickerPosition(position) {
            if (kickerPositions.contains(position)) {
                this.kickerPosition = position;
            }
        }
    }

    let intptr = {
        interpreters: [],
        startInterpreters: [],
        stopAll: false,
        robotsRunning: 0
    };

    /**
     * Generates an init function to generate all required robot functions
     * for a certain robot
     * @param {RobotFunctions} robotFuncs RobotFunctions for the specified robot
     * @returns an init function for a JS-Interpreter Interpreter
     */
    intptr.generateInitFunc = function(robotFuncs) {
        return function (interpreter, globalObject) {
            // Loop through all possible functions and allow
            // them to be used in the sandbox interpreter environment
            for (let func of motorFunctions) {
                interpreter.setProperty(globalObject, func, 
                    interpreter.createNativeFunction(robotFuncs[func].bind(robotFuncs)));
            }
        };
    };

    /**
     * Generate JS-Interpreter Interpreters
     * @param {Array<Robot>} robots All robots to generate interpreters for
     * @param {Array<String>} codes Each code for each robot
     */
    intptr.generateInterpreters = function(robots, codes, ball) {
        intptr.robotsRunning = robots.length;
        intptr.robots = robots;
        for (let i = 0; i < robots.length; i++) {
            let robotFuncs = new RobotFunctions(intptr.robots[i], ball, i);
            let startFuncs = new DummyRobotFunctions(intptr.robots[i], ball, i);
            let interpreter = new Interpreter(codes[i], intptr.generateInitFunc(robotFuncs));
            let startInterpreter = new Interpreter(codes[i], intptr.generateInitFunc(startFuncs));
            intptr.interpreters.push(interpreter);
            intptr.startInterpreters.push(startInterpreter);
        }
        return intptr.interpreters;
    };

    intptr.stopSim = function(robots) {
        intptr.stopAll = true;
    };

    /**
     * 
     * @param {Array<Robot>} array of Robots to start simulation
     * @param {*} codes JS code that robots will run
     */
    intptr.startSim = function(robots, codes, ball) {
        intptr.stopAll = false;
        intptr.robotsRunning = 0;
        intptr.interpreters = [];
        intptr.startInterpreters = [];
        let interpreters = intptr.generateInterpreters(robots, codes, ball);

        // Set the starting positions for all robots
        for (let interpreter of intptr.startInterpreters) {
            let i = 0;
            while (!intptr.stopAll && i < 1000) {
                interpreter.step();
                i++;
            }
        }

        // Set kicker position if kicking
        for (let robot of robots) {
            if (robot.kicking) {
                robot.setPos(positionMap['forward'].x, positionMap['forward'].y);
            }
        }
        
        // Keep track of timing, in order to keep the robots moving consistently
        // regardless of computer specs
        let prev = [];
        let tickrate = 1000/60; // 60 fps for interpreting code
        // Tick rate is divided between all robots

        function nextStep(interpreter, r) {
            prev[r] = performance.now();
            let i = 0;
            while (!intptr.stopAll && (prev[r] + tickrate / intptr.robotsRunning) > performance.now()) {
                if (++i > 498) { // only perform 500 steps per tick
                    continue;
                }
                interpreter.step();
            }
            // console.log(i); // i must be less than 2000 for the competition - TODO
            i = 0;
            if (interpreter.step() && !intptr.stopAll) {
                window.setTimeout(() => {
                    nextStep(interpreter, r);
                }, 0);
            } else {
                // Stop the robot if there are no more steps remaining or user has hit 'stop'.
                robots[r].setMotorSpeed(0, 0);
                robots[r].setMotorSpeed(1, 0);
                if (robots[r].type === 'TriBot') {
                    robots[r].setMotorSpeed(2, 0);
                }
                intptr.robotsRunning--;
            }
        }

        for (let r in interpreters) {
            let interpreter = interpreters[r];
            prev[r] = performance.now(); // set the first tick of the robot
            nextStep(interpreter, r);
        }
    };

    window.intptr = intptr;
})();