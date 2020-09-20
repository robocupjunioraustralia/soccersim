;(function(Matter) {
    "use strict";
    // Matter-js libraries
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Body = Matter.Body,
        Events = Matter.Events,
        Vector = Matter.Vector,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        World = Matter.World,
        Composite = Matter.Composite,
        Constraint = Matter.Constraint,
        Bodies = Matter.Bodies;
    
    var degToRad = Math.PI/180,
        radToDeg = 180/Math.PI,
        fieldWidth = 546,
        fieldHeight = 729,
        yellow = '#ffff00',
        blue = '#0000ff',
        white = '#ffffff',
        black = '#000000',
        angleLimit = 0.01;
    
    class SoccerSim {

        /**
         * Soccer simulation class
         * 
         * @constructor
         * @param {HTMLElement} element parent element to place the rendered field on
         * @param {Array<Robot>} robots List of robots to include in the simulator
         * @param {Matter.Body} ball a ball
         */
        constructor(element, robots, ball) {
            this.engine = Engine.create();
            this.world = this.engine.world;
            this.robots = robots;
            this.ball = ball;

            // World customisations
            this.world.gravity.scale = 0;
            this.world.gravity.x = 0;
            this.world.gravity.y = 0;

            // create renderer
            this.render = Render.create({
                element: element,
                engine: this.engine,
                options: {
                    width: fieldWidth,
                    height: fieldHeight,
                    showVelocity: true,
                    wireframes: false
                }
            });

            Render.run(this.render);

            // create runner
            this.runner = Runner.create();
            Runner.run(this.runner, this.engine);

            // Field markings and objects array
            let fieldObjects = this.createFieldObjects();
            // Ball array
            let balls = [this.ball];
            // Borders array
            let walls = [];
            walls.push(Bodies.rectangle(fieldWidth/2, 0, fieldWidth, 20, { isStatic: true }),
                    Bodies.rectangle(fieldWidth/2, fieldHeight, fieldWidth, 20, { isStatic: true }),
                    Bodies.rectangle(fieldWidth, fieldHeight/2, 20, fieldHeight, { isStatic: true }),
                    Bodies.rectangle(0, fieldHeight/2, 20, fieldHeight, { isStatic: true }));
            // Add all robots
            let bots = [];
            for (var i = 0; i < this.robots.length; i++) {
                bots.push(this.robots[i].body);
            }
            // Add to world
            World.add(this.world, fieldObjects);
            World.add(this.world, balls);
            World.add(this.world, walls);
            World.add(this.world, bots);

            // add mouse control
            var mouse = Mouse.create(this.render.canvas),
                mouseConstraint = MouseConstraint.create(this.engine, {
                    mouse: mouse,
                    constraint: {
                        stiffness: 0.2,
                        render: {
                            visible: false
                        }
                    }
                });

            World.add(this.world, mouseConstraint);

            // keep the mouse in sync with rendering
            this.render.mouse = mouse;

            // fit the render viewport to the scene
            Render.lookAt(this.render, {
                min: { x: 0, y: 0 },
                max: { x: fieldWidth, y: fieldHeight }
            });

            // Perform updates to robot forces
            Events.on(this.engine, 'beforeUpdate', function (event) {
                for (var i = 0; i < bots.length; i++){
                    robots[i].updateForce();
                }
            });
        }

        // Create all elements of the playing field
        createFieldObjects(){

            // Create field
            let field = Matter.Bodies.rectangle(fieldWidth/2, fieldHeight/2, fieldWidth, fieldHeight, {
                collisionFilter: {
                    group: -1,
                    category: 2,
                    mask: 0,
                },
                render: { fillStyle: '#366f0b'}
            });

            // Create markings body
            let top = Bodies.rectangle(fieldWidth/2, 0.1 * fieldHeight, 0.74*fieldWidth, 14, {isSensor: true, render: {fillStyle : white}}),
            bottom = Bodies.rectangle(fieldWidth/2, 0.9 * fieldHeight, 0.74*fieldWidth, 14, {isSensor: true, render: {fillStyle : white}}),
                right = Bodies.rectangle(0.86*fieldWidth, fieldHeight/2, 14, 0.81*fieldHeight, {isSensor: true, render: {fillStyle : white}}),
                left = Bodies.rectangle(0.14*fieldWidth, fieldHeight/2, 14, 0.81*fieldHeight, {isSensor: true, render: {fillStyle : white}}),
                markings = Body.create({parts: [top,bottom,left,right], isSensor: true, isStatic: true});
            
            // Penalty areas
            bottom = Bodies.rectangle(fieldWidth/2, 0.77 * fieldHeight, 0.5*fieldWidth, 7, {isSensor: true, render: {fillStyle : black}});
            right = Bodies.rectangle(0.75*fieldWidth, 0.84*fieldHeight, 7, 0.14*fieldHeight, {isSensor: true, render: {fillStyle : black}});
            left = Bodies.rectangle(0.25*fieldWidth, 0.84*fieldHeight, 7, 0.14*fieldHeight, {isSensor: true, render: {fillStyle : black}});
            let topPenalty = Body.create({parts: [bottom,left,right], isSensor: true, isStatic: true});

            top = Bodies.rectangle(fieldWidth/2, 0.23 * fieldHeight, 0.5*fieldWidth, 7, {isSensor: true, render: {fillStyle : black}});
            right = Bodies.rectangle(0.75*fieldWidth, 0.16*fieldHeight, 7, 0.14*fieldHeight, {isSensor: true, render: {fillStyle : black}});
            left = Bodies.rectangle(0.25*fieldWidth, 0.16*fieldHeight, 7, 0.14*fieldHeight, {isSensor: true, render: {fillStyle : black}});
            let bottomPenalty = Body.create({parts: [top,left,right], isSensor: true, isStatic: true});

            // Goal posts
            top = Bodies.rectangle(fieldWidth/2, 0.93 * fieldHeight, 0.25*fieldWidth, 4, {render: {fillStyle : black}});
            right = Bodies.rectangle(0.62*fieldWidth, 0.91*fieldHeight, 4, 0.04*fieldHeight, {render: {fillStyle : black}});
            left = Bodies.rectangle(0.38*fieldWidth, 0.91*fieldHeight, 4, 0.04*fieldHeight, {render: {fillStyle : black}});
            let topGoalPost = Body.create({parts: [top,left,right], isStatic: true});

            bottom = Bodies.rectangle(fieldWidth/2, 0.07 * fieldHeight, 0.25*fieldWidth, 4, {render: {fillStyle : black}});
            right = Bodies.rectangle(0.62*fieldWidth, 0.09*fieldHeight, 4, 0.04*fieldHeight, {render: {fillStyle : black}});
            left = Bodies.rectangle(0.38*fieldWidth, 0.09*fieldHeight, 4, 0.04*fieldHeight, {render: {fillStyle : black}});
            let bottomGoalPost = Body.create({parts: [bottom,left,right], isStatic: true});

            // Goal areas
            let yellowArea = Bodies.rectangle(fieldWidth/2, 0.92 * fieldHeight, 0.24*fieldWidth, 15, {isSensor: true, render: {fillStyle : yellow}});
            let blueArea = Bodies.rectangle(fieldWidth/2, 0.08 * fieldHeight, 0.24*fieldWidth, 15, {isSensor: true, render: {fillStyle : blue}});

            // Black dots
            let dotOne = Bodies.circle(fieldWidth/2, fieldHeight/2, 4, {isSensor: true, isStatic: true, render: {fillStyle : black}}),
                dotTwo = Bodies.circle(0.33*fieldWidth, fieldHeight/2, 4, {isSensor: true, isStatic: true, render: {fillStyle : black}}),
                dotThree = Bodies.circle(0.66*fieldWidth, fieldHeight/2, 4, {isSensor: true, isStatic: true, render: {fillStyle : black}});
            
            let fieldObjects = [field, topPenalty, bottomPenalty, blueArea, yellowArea, markings, topGoalPost, bottomGoalPost, dotOne, dotTwo, dotThree];
            return fieldObjects;
        }

        /**
         * Allow this class to work with MatterTools.Demo
         */
        demo() {
            return {
                engine: this.engine,
                runner: this.runner,
                render: this.render,
                canvas: this.render.canvas,
                stop: function() {
                    Matter.Render.stop(this.render);
                    Matter.Runner.stop(this.runner);
                }
            };
        }
    }
    
    class Robot {
        /**
         * Abstract class Robot containing all explanations and methods to be overwritten
         * @param {team} team is the team's goal colour, yellow or blue. TODO: Currently blue team faces up, Yellow is down
         */
        constructor(team) {
            // Prevent instantiation of Robot class
            if (new.target === Robot) {
                throw new TypeError("Cannot instantiate abstract Robot class");
            }
            this.team = team;
            this.motors = [];
            this.motorPos = [];
            this.motorOffsets = [];
            this.numMotors = 0;
            this.forces = [];
            this.prevAngle = 0;
        }

        /*     ----     Methods that apply to all robots      ----      */

        // Gets the relative position of the ball from current robot
        // Returns an object containing centre-to-centre distance and angle in radians
        getBallPosition(ball){
            let ballPos = {x: ball.position.x, y: ball.position.y},
                robPos = this.getPos(),
                delta = {x: ballPos.x - robPos.x, y: -1 * (ballPos.y - robPos.y)},
                distance = Math.sqrt( Math.pow(delta.x,2) + Math.pow(delta.y,2) ),
                ballBearing = Vector.angle(robPos,ball.position)*radToDeg;
            
            // Adjust from x-axis reference to y-axis reference
            ballBearing += 270;

            // Adjust based on colour
            if (this.team == 'blue') {
                ballBearing += 180;
            }
            
            // Adjust based on robot heading
            ballBearing -= this.getBearing() * radToDeg;
            
            // Wrap between -180 and 180
            ballBearing = (ballBearing + 360) % (360);
            if (ballBearing > 180) {
                ballBearing -= 360;
            }

            return {distance: distance, angle: ballBearing*degToRad};
        }

        // Unit direction vector pointing in robot's forward direction
        getDirectionVector(){
            let angle = this.getAngle(),
                x = Math.sin(angle),
                y = Math.cos(angle);
            return {x: x, y: y};
        }

        // Remind self how many motors robot contains
        getNumMotors(){
            return this.numMotors;
        }

        // Get current robot body centroid position
        getPos(){
            return this.body.bodies[0].position;
        }

        // Get relative bearing angle in radians
        // Blue team 0rad points up, yellow team 0rad points down
        getBearing(){
            let angle = this.getAngle() % (2*Math.PI);

            // Compensate for yellow facing other way to blue
            if (this.team == 'blue'){
                angle += Math.PI;
            }

            // Wrap between -180 and 180 deg
            angle = (angle + 2*Math.PI) % (2*Math.PI);

            if (angle > Math.PI) {
                angle -= 2*Math.PI;
            }
            return angle;
        }

        // Get absolute body angle in radians
        getAngle(){
            return this.body.bodies[0].angle;
        }

        // Get array of current set motor speeds
        getMotorSpeeds(){
            return this.motors;
        }

        // Get array of motor bodies
        getMotors(){
            let arr = [];
            for (var i = 0; i < this.numMotors; i++){
                arr.push(this.body.bodies[i+1]);
            }
            return arr;
        }

        // Check if the robot bearing has changed
        checkChange(){
            let currAngle = this.getAngle();
            if (this.prevAngle < currAngle + angleLimit && this.prevAngle > currAngle - angleLimit){
                return false;
            } else {
                this.prevAngle = currAngle;
                return true;
            }
        }

        /*    ----      Method prototypes for inheritance      ----     */

        // Update force per tick
        updateForce(){
            console.error('Please overwrite updateForce');
        }

        // Force calculations depend on specific robot type
        calculateForce(){
            console.error('Please overwrite calculateForce');
        }

        // Setting motor speeds depend on motor setup
        setMotorSpeed(motorNum, speed){
            console.error('Please overwrite setMotorSpeed');
        }

        // Create compound body representing body of robot and its motors
        createBot(xPos, yPos, bodyWidth, bodyHeight, motorWidth, motorHeight) {
            console.error('Please overwrite createBot');
        }
    }

    class UniBot extends Robot{
        /**
         * Bot with single motor in the centre, can only move forwards and back
         * @param {*} team team colour
         * @param {*} x initial position along the x axis
         * @param {*} y initial position along the y axis
         */
        constructor(team, x, y) {
            super(team);
            this.createBot(team, x, y, 50, 50, 10, 25);
        }

        // Create a square robot with wheel in the centre
        createBot(team, xPos, yPos, bodyWidth, bodyHeight, motorWidth, motorHeight){

            let group = Body.nextGroup(true),
                motorOffset = {x: 0, y: 0},
                bodyColour,
                motorColour;
            
            // Define colours for each team
            if (team == 'blue'){
                bodyColour = blue;
                motorColour = white;
            } else {
                bodyColour = yellow;
                motorColour = black;
            }
        
            let robot = Composite.create({ label: 'UniBot' }),
                body = Bodies.rectangle(xPos, yPos, bodyWidth, bodyHeight, {
                    collisionFilter: { group: group },
                    frictionAir: 0.1, 
                    render: { fillStyle: bodyColour, strokeStyle: '#2E2B44', lineWidth: 1}
                });
        
            let motor = Bodies.rectangle(xPos + motorOffset.x, yPos + motorOffset.y, motorWidth, motorHeight, {
                collisionFilter: { group: group },
                frictionAir: 0.1, 
                render: { fillStyle: motorColour, strokeStyle: '#2E2B44', lineWidth: 1}
            });
                        
            let attachA = Constraint.create({
                bodyA: motor,
                pointA: {x: 0, y: motorHeight/2},
                bodyB: body,
                pointB: { x: motorOffset.x, y: motorHeight/2 },
                stiffness: 1,
                length: 0
            });

            let attachB = Constraint.create({
                bodyA: motor,
                pointA: {x: 0, y: -motorHeight/2},
                bodyB: body,
                pointB: { x: motorOffset.x, y: -motorHeight/2 },
                stiffness: 1,
                length: 0
            });
            
            Composite.addBody(robot, body);
            Composite.addBody(robot, motor);
            Composite.addConstraint(robot, attachA);
            Composite.addConstraint(robot, attachB);
    
            this.body = robot;
            this.prevAngle = this.getAngle();
            this.setupMotors(motorOffset);

            // Rotate entire composite shape if blue team
            if (team == 'blue'){
                Composite.rotate(this.body,180*degToRad,{x: xPos, y: yPos});
            }
        }

        // Single motor in the centre
        setupMotors(offset){
            this.numMotors = 1;
            this.motors.push(0);
            this.motorOffsets.push(offset);
            this.forces.push({fx: 0, fy:0});
        }

        // update force applied to robot per time tick
        updateForce(){
            if (this.checkChange() == true){
                this.calculateForce();  
            }
            let forces = this.forces,
                vector = {x: forces[0].fx, y: forces[0].fy},
                motor = this.getMotors()[0];
            Body.applyForce(motor, motor.position, vector);
        }

        // Set speed of the one motor regardless of motorNum
        setMotorSpeed(motorNum, speed){
            this.motors[0] = speed;
            this.calculateForce();
        }

        // Calculate relative force for single motor
        calculateForce(){
            let forces = [],
                absF = (this.motors[0])/100,
                direction = this.getDirectionVector(),
                relFx = -1 * absF * direction.x,
                relFy = absF * direction.y;
            forces.push({
                fx: relFx, 
                fy: relFy
            });
            this.forces = forces;
        }
    }

    class DualBot extends Robot{
        // TODO: currently contains hardcoding of bot and motor dimensions/position
        /**
         * Bot with 2 motors, one on each side. Can move forwards and back, as well as turn and spin
         * @param {*} team team colour
         * @param {*} x initial position along the x axis
         * @param {*} y initial position along the y axis
         */
        constructor(team, x, y) {
            super(team);
            this.createBot(team, x, y, 50, 50, 10, 25);
        }
        // Create a square robot with wheels on either side
        createBot(team, xPos, yPos, bodyWidth, bodyHeight, motorWidth, motorHeight){

            let group = Body.nextGroup(true),
                motorOffset = [{x: bodyWidth/2, y: 0}, {x: -bodyWidth/2, y: 0}],
                bodyColour,
                motorColour;
            
            // Define colours for each team
            if (team == 'blue'){
                bodyColour = blue;
                motorColour = white;
            } else {
                bodyColour = yellow;
                motorColour = black;
            }
        
            let robot = Composite.create({ label: 'DualBot' }),
                body = Bodies.rectangle(xPos, yPos, bodyWidth, bodyHeight, {
                    collisionFilter: { group: group },
                    frictionAir: 0.1, 
                    render: { fillStyle: bodyColour, strokeStyle: '#2E2B44', lineWidth: 1}
                });
        
            let motorA = Bodies.rectangle(xPos + motorOffset[0].x, yPos + motorOffset[0].y, motorWidth, motorHeight, {
                collisionFilter: { group: group },
                frictionAir: 0.1, 
                render: { fillStyle: motorColour, strokeStyle: '#2E2B44', lineWidth: 1}
            });

            let motorB = Bodies.rectangle(xPos + motorOffset[1].x, yPos + motorOffset[1].y, motorWidth, motorHeight, {
                collisionFilter: { group: group },
                frictionAir: 0.1, 
                render: { fillStyle: motorColour, strokeStyle: '#2E2B44', lineWidth: 1}
            });
                        
            let attachAA = Constraint.create({
                bodyA: motorA,
                pointA: {x: 0, y: motorHeight/2},
                bodyB: body,
                pointB: { x: motorOffset[0].x, y: motorHeight/2 },
                stiffness: 1,
                length: 0
            });

            let attachAB = Constraint.create({
                bodyA: motorA,
                pointA: {x: 0, y: -motorHeight/2},
                bodyB: body,
                pointB: { x: motorOffset[0].x, y: -motorHeight/2 },
                stiffness: 1,
                length: 0
            });

            let attachBA = Constraint.create({
                bodyA: motorB,
                pointA: {x: 0, y: motorHeight/2},
                bodyB: body,
                pointB: { x: motorOffset[1].x, y: motorHeight/2 },
                stiffness: 1,
                length: 0
            });

            let attachBB = Constraint.create({
                bodyA: motorB,
                pointA: {x: 0, y: -motorHeight/2},
                bodyB: body,
                pointB: { x: motorOffset[1].x, y: -motorHeight/2 },
                stiffness: 1,
                length: 0
            });
            
            Composite.addBody(robot, body);
            Composite.addBody(robot, motorA);
            Composite.addBody(robot, motorB);
            Composite.addConstraint(robot, attachAA);
            Composite.addConstraint(robot, attachAB);
            Composite.addConstraint(robot, attachBA);
            Composite.addConstraint(robot, attachBB);
    
            this.body = robot;
            this.prevAngle = this.getAngle();
            this.setupMotors(motorOffset);

            // Rotate entire composite shape if blue team
            if (team == 'blue'){
                Composite.rotate(this.body,180*degToRad,{x: xPos, y: yPos});
            }
        }

        // One motor on either side, 2 total
        setupMotors(offset){
            this.numMotors = 2;
            this.motors.push(0,0);
            this.motorOffsets.push(offset[0],offset[1]);
            this.forces.push({fx: 0, fy:0},{fx: 0, fy:0});
        }

        // update force applied to robot per time tick
        updateForce(){
            if (this.checkChange() == true){
                this.calculateForce();
            }
            let forces = this.forces,
                vector = {},
                motor;
            for (var i = 0; i < this.numMotors; i++){
                vector = {x: forces[i].fx, y: forces[i].fy};
                motor = this.getMotors()[i];
                Body.applyForce(motor, motor.position, vector);
            }
        }

        // Set speed of the one motor
        setMotorSpeed(motorNum, speed){
            if (motorNum < this.numMotors){
                this.motors[motorNum] = speed;
            }
            this.calculateForce();
        }
        
        // Set speed of both motors
        setBothMotorSpeeds(speed0, speed1){
            this.motors[0] = speed0;
            this.motors[1] = speed1;
            this.calculateForce();
        }

        // Calculate relative force for dual motors
        calculateForce(){
            let forces = [],
                direction = this.getDirectionVector();

            for (var i = 0; i < this.numMotors; i++){
                let absF = (this.motors[i])/100,
                    relFx = -1 * absF * direction.x,
                    relFy = absF * direction.y;
                forces.push({
                    fx: relFx, 
                    fy: relFy
                });
            }
            this.forces = forces;
        }

    }
    
    // TODO: move this to another file
    let title = document.getElementsByTagName("title")[0].innerHTML;

    // Define robots on the field
    let one = new DualBot('blue',100,300),
    two = new UniBot('blue',400,300),
    three = new DualBot('yellow',100,100),
    four = new UniBot('yellow', 400,100);

    let robots = [one, two, three, four];
    window.One = one;
    window.Two = two;
    window.Three = three;
    window.Four = four;

    // define the ball
    let ball = Bodies.circle(300, 100, 10, {
        frictionAir: 0.1,
        render: {fillStyle: '#f95a00'}
    });
    window.Ball = ball;

    // Print title of the browser tab
    console.log(title);
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
        var sim = new SoccerSim(document.getElementById('matterjs'), robots, ball);
        // Engine.run(sim.engine);
        // Render.run(sim.render);
    }
})(Matter);