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
    
    var degToRad = Math.PI/180;
    var radToDeg = 180/Math.PI;
    
    class SoccerSim {

        /**
         * Soccer simulation class
         * 
         * @constructor
         * @param {Array<Robot>} robots List of robots to include in the simulator
         * @param {Matter.Body} ball a ball
         */
        constructor(robots, ball) {
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
                element: document.body,
                engine: this.engine,
                options: {
                    width: 546,
                    height: 729,
                    showVelocity: true,
                    wireframes: false
                }
            });

            Render.run(this.render);

            // create runner
            this.runner = Runner.create();
            Runner.run(this.runner, this.engine);

            
            // Create obj containing all bodies
            // Ball array
            let balls = [this.ball];
            // Borders array
            let walls = [];
            walls.push(Bodies.rectangle(546/2, 0, 546, 50, { isStatic: true }),
                    Bodies.rectangle(546/2, 729, 546, 50, { isStatic: true }),
                    Bodies.rectangle(546, 729/2, 50, 729, { isStatic: true }),
                    Bodies.rectangle(0, 729/2, 50, 729, { isStatic: true }));
            // Add all robots
            let bots = [];
            for (var i = 0; i < this.robots.length; i++) {
                bots.push(this.robots[i].body);
            }
            // Add to world
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
                max: { x: 546, y: 729 }
            });

            // Perform updates to robot forces
            Events.on(this.engine, 'beforeUpdate', function (event) {
                for (var i = 0; i < bots.length; i++){
                    robots[i].updateForce();
                }
            });
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
         * @param {x} x is the x position of the robot
         * @param {y} y is the y position of the robot
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

            // Compensate for rotation relative to y axis instead of x axis
            if (this.team == 'blue'){
                if (ballBearing <= 90 && ballBearing >= -180){
                    ballBearing += 90;
                } else if (ballBearing > 90) {
                    ballBearing -= 270;
                }
            } else {
                if (ballBearing >= -90 && ballBearing <= 180){
                    ballBearing -= 90;
                } else if (ballBearing < -90) {
                    ballBearing += 270;
                }
            }

            // Compensate for robot bearing
            let robotBearing = this.getBearing()*radToDeg,
                angle = 0;
            if (robotBearing < ballBearing){
                angle = ballBearing - robotBearing;
            } else {
                angle = -1 * (robotBearing - ballBearing);
            }

            // Limit angle within -180 to 180 deg
            if (angle > 180){
                angle = -1 * (360-angle);
            } else if (angle < -180){
                angle += 360;
            }

            return {distance: distance, angle: angle*degToRad};
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
            let angle = (this.getAngle()*radToDeg)%360;

            // Compensate for yellow facing other way to blue
            if (this.team == 'blue'){
                angle -= 180;
            }

            let res = angle;
            // If rotated rightwards
            if (angle > 180) {
                res = -1 * (360-angle);
            // If rotated leftwards
            } else if (angle < -180){
                res = angle + 360;
            }
            return res*degToRad;
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
        // Bot with single motor in the centre, can only move forwards and back
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
                bodyColour = '#0000ff';
                motorColour = '#ffffff';
            } else {
                bodyColour = '#ffff00';
                motorColour = '#000000';
            }
        
            let robot = Composite.create({ label: 'UniBot' }),
                body = Bodies.rectangle(xPos, yPos, bodyWidth, bodyHeight, {
                    collisionFilter: { group: group },
                    frictionAir: 0.1, 
                    render: { fillStyle: bodyColour}
                });
        
            let motor = Bodies.rectangle(xPos + motorOffset.x, yPos + motorOffset.y, motorWidth, motorHeight, {
                collisionFilter: { group: group },
                frictionAir: 0.1, 
                render: { fillStyle: motorColour}
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
        }

        // update force applied to robot per time tick
        updateForce(){
            let forces = this.calculateForce(),
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
            return forces;
        }
    }

    // TODO update dualbot for composite shapes
    class DualBot extends Robot{
        // Bot with 2 motors, one on each side
        // Can move forwards and back, as well as turn and spin
        // TODO: currently contains hardcoding of motor position
        constructor(team, x, y) {
            super(team);
            this.createBot(team, x, y, 50, 50, 10, 25);
        }

        // One motor on either side, 2 total
        setupMotors(){
            this.numMotors = 2;
            this.motors.push(0,0);
            this.motorOffsets.push(
                {x: 25, y: 0},
                {x:-25, y: 0}
            );
            let offsets = this.motorOffsets,
                centroid = this.getPos();
            this.motorPos.push(
                {x: centroid.x + offsets[0].x, y: centroid.y + offsets[0].y}, 
                {x: centroid.x + offsets[1].x, y: centroid.y + offsets[1].y}
            );
        }

        createBot(xPos, yPos, bodyWidth, bodyHeight, motorWidth, motorHeight){
            let group = Body.nextGroup(true),
                wheelBase = 50,
                wheelAOffset = -width * 0.5 + wheelBase,
                wheelBOffset = width * 0.5 - wheelBase,
                wheelYOffset = 0;
        
            let car = Composite.create({ label: 'Car' }),
                body = Bodies.rectangle(xx, yy, width, height, { 
                    collisionFilter: {
                        group: group
                    }
                });
        
            let wheelA = Bodies.rectangle(xx + wheelAOffset, yy + wheelYOffset, motorWidth, motorHeight, { 
                collisionFilter: {
                    group: group
                },
                friction: 0.8
            });
                        
            let wheelB = Bodies.rectangle(xx + wheelBOffset, yy + wheelYOffset, motorWidth, motorHeight, { 
                collisionFilter: {
                    group: group
                },
                friction: 0.8
            });
                        
            let axelA = Constraint.create({
                bodyB: body,
                pointB: { x: wheelAOffset, y: 12 },
                bodyA: wheelA,
                pointA: {x: 0, y: 12},
                stiffness: 1,
                length: 0
            });

            let axelC = Constraint.create({
                bodyB: body,
                pointB: { x: wheelAOffset, y: -12 },
                bodyA: wheelA,
                pointA: {x: 0, y: -12},
                stiffness: 1,
                length: 0
            });
                            
            let axelB = Constraint.create({
                bodyB: body,
                pointB: { x: wheelBOffset, y: 12 },
                bodyA: wheelB,
                pointA: {x: 0, y: 12},
                stiffness: 1,
                length: 0
            });

            let axelD = Constraint.create({
                bodyB: body,
                pointB: { x: wheelBOffset, y: -12},
                bodyA: wheelB,
                pointA: {x: 0, y: -12},
                stiffness: 1,
                length: 0
            });
            
            Composite.addBody(car, body);
            Composite.addBody(car, wheelA);
            Composite.addBody(car, wheelB);
            Composite.addConstraint(car, axelA);
            Composite.addConstraint(car, axelB);
            
            Composite.addConstraint(car, axelC);
            Composite.addConstraint(car, axelD);

    
            return car;
        }

        // Update location of motors per time tick
        updatePos(){
            let centroid = this.getPos(),
                direction = this.getDirectionVector(),
                magnitude = 25,
                relx = magnitude * direction.y,
                rely = magnitude * direction.x;

            this.motorPos[0].x = centroid.x + relx;
            this.motorPos[0].y = centroid.y + rely;

            this.motorPos[1].x = centroid.x - relx;
            this.motorPos[1].y = centroid.y - rely;
        }

        // update force applied to robot per time tick
        updateForce(){
            let forces = this.calculateForce(),
                vector = {};
            for (var i = 0; i < this.numMotors; i++){
                vector = {x: forces[i].fx, y: forces[i].fy};
                Body.applyForce(this.body, forces[i].from, vector);
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
                let mPos = this.motorPos[i],
                    absF = (this.motors[i])/100,
                    relFx = -1 * absF * direction.x,
                    relFy = absF * direction.y;
                forces.push({
                    fx: relFx, 
                    fy: relFy, 
                    from: mPos
                });
            }

            return forces;
        }

    }
    
    // TODO: move this to another file
    let title = document.getElementsByTagName("title")[0].innerHTML;

    // Print title of the browser tab
    console.log(title);
    if (title === 'Matter.js Demo') {
        // Define robots on the field
        let one = new UniBot('blue',100,300),
            two = new UniBot('blue',400,300),
            three = new UniBot('yellow',100,100),
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

        // Create a new simulation if selected
        window.Example = window.Example || {};
        window.Example.soccer = function() {
            var sim = new SoccerSim(robots, ball);
            return sim.demo();
        };
    }
})(Matter);