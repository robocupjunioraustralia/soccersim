/**
 * @description Interpreter to run user submitted code and act as an API between
 * Blockly and the matter-js environment.
 */
;(function() {

    var motorFunctions = [
        'setMotorSpeed',
        // 'stopMotor',
        // 'getMotorSpeed'
    ];

    class RobotFunctions {
        constructor(robot) {
            this.robot = robot;
            this.speeds = [0, 0];
        }
        setMotorSpeed(motor, speed) {
            if (typeof speed !== 'number') return;
            if (speed > 100) speed = 100;
            if (speed < -100) speed = -100;
            switch (motor) {
                case 'motorA':
                    this.robot.setMotorSpeed(0, speed / 200);
                    this.speeds[0] = speed;
                    break;
                case 'motorB':
                    this.robot.setMotorSpeed(1, speed / 200);
                    this.speeds[1] = speed;
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
                    this.speeds[0] = 0;
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
                default:
                    return 0;
            }
        }
    }

    let intptr = {
        interpreters: [],
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
     * @param {Robot} robots All robots to generate interpreters for
     * @param {Array<String>} codes Each code for each robot
     */
    intptr.generateInterpreters = function(robots, codes) {
        intptr.robotsRunning = robots.length;
        intptr.robots = robots;
        for (let i = 0; i < robots.length; i++) {
            let robotFuncs = new RobotFunctions(robots[i]);
            let interpreter = new Interpreter(codes[i], intptr.generateInitFunc(robotFuncs));
            intptr.interpreters.push(interpreter);
        }
        return intptr.interpreters;
    };

    intptr.stopSim = function(robots) {
        intptr.stopAll = true;
        intptr.robots.forEach((robot) => {
            robot.setMotorSpeed(0, 0);
            robot.setMotorSpeed(1, 0);
        });
    };

    intptr.startSim = function(robots, codes) {
        intptr.stopAll = false;
        intptr.robotsRunning = 0;
        intptr.interpreters = [];
        let interpreters = intptr.generateInterpreters(robots, codes);
        interpreters.forEach((interpreter) => {
            function nextStep() {
                var i = 0;
                while (!intptr.stopAll && ++i < 1000 * (intptr.robotsRunning + 3)) {
                    interpreter.step();
                }
                if (interpreter.step() && !intptr.stopAll) {
                    window.setTimeout(nextStep, 0);
                } else {
                    intptr.robotsRunning--;
                }
            }
            nextStep();
        });
    };

    window.intptr = intptr;
})();