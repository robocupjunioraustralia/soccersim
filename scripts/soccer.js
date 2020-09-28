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
        Bodies = Matter.Bodies,
        Vertices = Matter.Vertices,
        Svg = Matter.Svg;
    
    // Global variables
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
            let yellowArea = Bodies.rectangle(fieldWidth/2, 0.92 * fieldHeight, 0.24*fieldWidth, 15, {isStatic: true, isSensor: true, render: {fillStyle : yellow}});
            let blueArea = Bodies.rectangle(fieldWidth/2, 0.08 * fieldHeight, 0.24*fieldWidth, 15, {isStatic: true, isSensor: true, render: {fillStyle : blue}});

            // Black dots
            let dotOne = Bodies.circle(fieldWidth/2, fieldHeight/2, 4, {isStatic: true, isSensor: true, render: {fillStyle : black}}),
                dotTwo = Bodies.circle(0.33*fieldWidth, fieldHeight/2, 4, {isStatic: true, isSensor: true, render: {fillStyle : black}}),
                dotThree = Bodies.circle(0.66*fieldWidth, fieldHeight/2, 4, {isStatic: true, isSensor: true, render: {fillStyle : black}});
            
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
            this.motorSpeeds = [];
            this.motorPos = [];
            this.motorOffsets = [];
            this.numMotors = 0;
            this.forces = [];
            this.prevAngle = 0;
        }

        /*     ----     Methods that apply to all robots      ----      */

        // Get absolute body angle in radians
        getAngle(){
            return this.body.bodies[0].angle;
        }
        
        // Gets the relative position of the ball from current robot
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

            // Returns an object containing centre-to-centre distance and angle in radians
            return {distance: distance, angle: ballBearing*degToRad};
        }

        // Get relative bearing angle in radians
        // TODO: Blue team 0rad points up, yellow team 0rad points down
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

        // Unit direction vector pointing in robot's forward direction
        getDirectionVector(){
            let angle = this.getAngle(),
                x = Math.sin(angle),
                y = Math.cos(angle);
            return {x: x, y: y};
        }

        // Get array of currently set motor speeds
        getMotorSpeeds(){
            return this.motorSpeeds;
        }

        // Get array of motor bodies
        getMotors(){
            let arr = [];
            for (var i = 0; i < this.numMotors; i++){
                arr.push(this.body.bodies[i+1]);
            }
            return arr;
        }
        // Get robot main body centroid position
        getPos(){
            return this.body.bodies[0].position;
        }

        // Check if the robot bearing has changed enough to require update
        checkChange(){
            let currAngle = this.getAngle();
            if ( (this.prevAngle < currAngle + angleLimit) && (this.prevAngle > currAngle - angleLimit) ){
                return false;
            } else {
                this.prevAngle = currAngle;
                return true;
            }
        }

        /*    ----      Method prototypes for inheritance      ----     */


        // Create compound body representing body of robot and its motors
        createBot(xPos, yPos, bodyWidth, bodyHeight, motorWidth, motorHeight) {
            console.error('Please overwrite createBot');
        }

        // Force calculations depend on specific robot type
        calculateForce(){
            console.error('Please overwrite calculateForce');
        }

        // Setting motor speeds depend on motor setup
        setMotorSpeed(motorNum, speed){
            console.error('Please overwrite setMotorSpeed');
        }
        
        // Update force per tick
        updateForce(){
            console.error('Please overwrite updateForce');
        }
    }

    class UniBot extends Robot{
        /**
         * Bot with single motor in the centre, can only move forwards and back
         * @param {*} team team colour
         * @param {*} x initial position along the x axis
         * @param {*} y initial position along the y axis
         * @param {dribbler} dribbler pair of forks on front of robot to 'catch' ball
         */
        constructor(team, x, y) {
            super(team);
            this.dribbler = {
                height: 4,
                width: 5,
                offset: 12
            };
            this.createBot(team, x, y, 50, 50, 10, 25);
        }

        // Create a square robot with wheel in the centre
        createBot(team, xPos, yPos, bodyWidth, bodyHeight, motorWidth, motorHeight){

            // Define a group of parts that won't collide with each other
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
            
            // Create an empty composite, the dribbler catch posts and centre body
            let robot = Composite.create({ label: 'UniBot' }),
                dribblerA = Bodies.rectangle(xPos + this.dribbler.offset, yPos + bodyHeight/2 + this.dribbler.height/2, this.dribbler.width, this.dribbler.height, {
                    render: {fillStyle: bodyColour, strokeStyle: '#2E2B44', lineWidth: 1}
                }),
                dribblerB = Bodies.rectangle(xPos - this.dribbler.offset, yPos + bodyHeight/2 + this.dribbler.height/2, this.dribbler.width, this.dribbler.height, {
                    render: {fillStyle: bodyColour, strokeStyle: '#2E2B44', lineWidth: 1}
                }),
                centre = Bodies.rectangle(xPos, yPos, bodyWidth, bodyHeight, {
                    render: { fillStyle: bodyColour, strokeStyle: '#2E2B44', lineWidth: 1},
                });

            // merge parts into single robot body
            let body = Body.create({
                    collisionFilter: { group: group },
                    frictionAir: 0.1, 
                    parts: [centre, dribblerA, dribblerB]
            });
            
            // central motor
            let motor = Bodies.rectangle(xPos + motorOffset.x, yPos + motorOffset.y, motorWidth, motorHeight, {
                collisionFilter: { group: group },
                frictionAir: 0.1, 
                render: { fillStyle: motorColour, strokeStyle: '#2E2B44', lineWidth: 1}
            });
            
            // Motor attach point A
            let attachA = Constraint.create({
                bodyA: motor,
                pointA: {x: 0, y: motorHeight/2},
                bodyB: body,
                pointB: { x: motorOffset.x, y: motorHeight/2 },
                stiffness: 1,
                length: 0
            });

            // Motor attach point B
            let attachB = Constraint.create({
                bodyA: motor,
                pointA: {x: 0, y: -motorHeight/2},
                bodyB: body,
                pointB: { x: motorOffset.x, y: -motorHeight/2 },
                stiffness: 1,
                length: 0
            });
            
            // Form the composite body
            Composite.addBody(robot, body);
            Composite.addBody(robot, motor);
            Composite.addConstraint(robot, attachA);
            Composite.addConstraint(robot, attachB);
            
            // Set attributes
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
            this.motorSpeeds.push(0);
            this.motorOffsets.push(offset);
            this.forces.push({fx: 0, fy:0});
        }

        // Set speed of the single motor regardless of motorNum
        setMotorSpeed(motorNum, speed){
            this.motorSpeeds[0] = speed;
            this.calculateForce();
        }

        // Calculate relative force for single motor
        calculateForce(){
            let forces = [],
                absF = (this.motorSpeeds[0])/100,
                direction = this.getDirectionVector(),
                // Relative forces are calculated based on direction vector
                relFx = -1 * absF * direction.x,
                relFy = absF * direction.y;
            forces.push({
                fx: relFx, 
                fy: relFy
            });
            this.forces = forces;
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
    }

    class DualBot extends Robot{
        // TODO: currently contains hardcoding of bot and motor dimensions/position
        /**
         * Bot with 2 motors, one on each side. Can move forwards and back, as well as turn and spin
         * @param {*} team team colour
         * @param {*} x initial position along the x axis
         * @param {*} y initial position along the y axis
         * @param {dribbler} dribbler pair of forks on front of robot to 'catch' ball
         */
        constructor(team, x, y) {
            super(team);
            this.dribbler = {
                height: 4,
                width: 5,
                offset: 12
            };
            this.createBot(team, x, y, 40, 40, 5, 20);
        }
        // Create a square robot with wheels on either side
        createBot(team, xPos, yPos, bodyWidth, bodyHeight, motorWidth, motorHeight){

            // Define a group of parts that won't collide with each other
            let group = Body.nextGroup(true),
            // Define motor centre position relative to origin of robot body
                motorOffset = [
                    { x: bodyWidth/2, y: 0 },
                    {x: -bodyWidth/2, y: 0 }],
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
        
            // Create an empty composite, the dribbler catch posts and centre body
            let robot = Composite.create({ label: 'DualBot' }),
                dribblerA = Bodies.rectangle(xPos + this.dribbler.offset, yPos + bodyHeight/2 + this.dribbler.height/2, this.dribbler.width, this.dribbler.height, {
                    render: {fillStyle: bodyColour, strokeStyle: '#2E2B44', lineWidth: 1}
                }),
                dribblerB = Bodies.rectangle(xPos - this.dribbler.offset, yPos + bodyHeight/2 + this.dribbler.height/2, this.dribbler.width, this.dribbler.height, {
                    render: {fillStyle: bodyColour, strokeStyle: '#2E2B44', lineWidth: 1}
                }),
                centre = Bodies.rectangle(xPos, yPos, bodyWidth, bodyHeight, {
                    render: { fillStyle: bodyColour, strokeStyle: '#2E2B44', lineWidth: 1},
            });

            // merge parts into single robot body
            let body = Body.create({
                    collisionFilter: { group: group },
                    frictionAir: 0.1, 
                    parts: [centre, dribblerA, dribblerB]
            });
            
            // Left motor
            let motorLeft = Bodies.rectangle(xPos + motorOffset[0].x, yPos + motorOffset[0].y, motorWidth, motorHeight, {
                collisionFilter: { group: group },
                frictionAir: 0.1, 
                render: { fillStyle: motorColour, strokeStyle: '#2E2B44', lineWidth: 1}
            });

            // Right motor
            let motorRight = Bodies.rectangle(xPos + motorOffset[1].x, yPos + motorOffset[1].y, motorWidth, motorHeight, {
                collisionFilter: { group: group },
                frictionAir: 0.1, 
                render: { fillStyle: motorColour, strokeStyle: '#2E2B44', lineWidth: 1}
            });
            
            // Left motor attachment point A
            let attachLeftA = Constraint.create({
                bodyA: motorLeft,
                pointA: {x: 0, y: motorHeight/2},
                bodyB: body,
                pointB: { x: motorOffset[0].x, y: motorHeight/2 },
                stiffness: 1,
                length: 0,
                render: { lineWidth: 0 }
            });

            // Left motor attachment point B
            let attachLeftB = Constraint.create({
                bodyA: motorLeft,
                pointA: {x: 0, y: -motorHeight/2},
                bodyB: body,
                pointB: { x: motorOffset[0].x, y: -motorHeight/2 },
                stiffness: 1,
                length: 0,
                render: { lineWidth: 0 }
            });

            // Right motor attachment point A
            let attachRightA = Constraint.create({
                bodyA: motorRight,
                pointA: {x: 0, y: motorHeight/2},
                bodyB: body,
                pointB: { x: motorOffset[1].x, y: motorHeight/2 },
                stiffness: 1,
                length: 0,
                render: { lineWidth: 0 }
            });

            // Right motor attachment point B
            let attachRightB = Constraint.create({
                bodyA: motorRight,
                pointA: {x: 0, y: -motorHeight/2},
                bodyB: body,
                pointB: { x: motorOffset[1].x, y: -motorHeight/2 },
                stiffness: 1,
                length: 0,
                render: { lineWidth: 0 }
            });
            
            // Form the composite body
            Composite.addBody(robot, body);
            Composite.addBody(robot, motorLeft);
            Composite.addBody(robot, motorRight);
            Composite.addConstraint(robot, attachLeftA);
            Composite.addConstraint(robot, attachLeftB);
            Composite.addConstraint(robot, attachRightA);
            Composite.addConstraint(robot, attachRightB);
    
            // Set attributes
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
            this.motorSpeeds.push(0,0);
            this.motorOffsets.push(offset[0],offset[1]);
            this.forces.push({fx: 0, fy:0},{fx: 0, fy:0});
        }

        // Set speed of the one motor
        setMotorSpeed(motorNum, speed){
            if (motorNum < this.numMotors){
                this.motorSpeeds[motorNum] = speed;
            }
            this.calculateForce();
        }
        
        // Set speed of both motors
        setMotorSpeedAll(speed0, speed1){
            this.motorSpeeds[0] = speed0;
            this.motorSpeeds[1] = speed1;
            this.calculateForce();
        }

        // Calculate relative force for dual motors
        calculateForce(){
            let forces = [],
                direction = this.getDirectionVector(),
                motorBodies = this.getMotors();
            // Calculate relative forces for all motors
            for (var i = 0; i < this.numMotors; i++){
                let absF = (this.motorSpeeds[i])/100,
                // Relative forces are calculated based on direction vector
                    relFx = -1 * absF * direction.x,
                    relFy = absF * direction.y;
                // Increase friction on non-active motors
                if (this.motorSpeeds[i] == 0) {
                    motorBodies[i].frictionAir = 0.8;
                } else {
                    motorBodies[i].frictionAir = 0.1;
                }
                forces.push({
                    fx: relFx, 
                    fy: relFy
                });
            }
            this.forces = forces;
        }

        // update force applied to robot per time tick
        updateForce(){
            // Only recalculate here if enough change in robot bearing
            if (this.checkChange() == true){
                this.calculateForce();
            }
            let forces = this.forces,
                vector = {},
                motor;
            // constantly apply forces as long as motors spin
            for (var i = 0; i < this.numMotors; i++){
                vector = {x: forces[i].fx, y: forces[i].fy};
                motor = this.getMotors()[i];
                Body.applyForce(motor, motor.position, vector);
            }
        }

    }

    class TriBot extends Robot{
        /**
         * Bot with three motors, 120 deg from each other. Motors defined in order of left, right, back
         * @param {*} team team colour
         * @param {*} x initial position along the x axis
         * @param {*} y initial position along the y axis
         */
        constructor(team, x, y) {
            super(team);
            this.createBot(team, x, y, 4, 12);
        }

        // JQuery and AJAX to fetch SVG file of robot outline
        parseSVG(name){
            if (typeof $ !== 'undefined') {
                // Ensure loading and processing of svg before further processing
                $.ajaxSetup({async: false});
                let vertices = [];
                $.get('../../assets/' + name + '.svg').done(function(data) {
                    $(data).find('path').each(function(i, path) {
                        let points = Svg.pathToVertices(path,3);
                        // Only required if SVG itself is upside down
                        Vertices.rotate(points,180*degToRad,{x:0,y:0});
                        vertices.push(points);
                    });
                });
                return vertices;
            }
        }

        // Create a square robot with wheel in the centre
        createBot(team, xPos, yPos, motorWidth, motorHeight){

            // Define a group of parts that won't collide with each other
            let group = Body.nextGroup(true),
                // In order of Left, Right, Back motors 
                motorOffset = [
                    {x: 17.5, y: 10},
                    {x: -17.5, y: 10},
                    {x: 0, y: -17.5}
                ],
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

            // Parse the SVG to create vertices
            let svgName = 'TriBot',
                vertices = this.parseSVG(svgName);
            
            // create empty composite body 
            let robot = Composite.create({ label: 'TriBot' });

            // Create main body from SVG vertices
            let body = Bodies.fromVertices(xPos, yPos, vertices, {
                collisionFilter: { group: group },
                frictionAir: 0.1,
                render: { fillStyle: bodyColour, strokeStyle: '#2E2B44', lineWidth: 1}
            });

            // Scale body to approx 50 pixel width/length
            Body.scale(body,0.3,0.3);
            
            // Left motor
            let motorLeft = Bodies.rectangle(xPos + motorOffset[0].x, yPos + motorOffset[0].y, motorWidth, motorHeight, {
                collisionFilter: { group: group },
                frictionAir: 0.1, 
                render: { fillStyle: motorColour, strokeStyle: '#2E2B44', lineWidth: 1}
            });

            // Right motor 
            let motorRight = Bodies.rectangle(xPos + motorOffset[1].x, yPos + motorOffset[1].y, motorWidth, motorHeight, {
                collisionFilter: { group: group },
                frictionAir: 0.1, 
                render: { fillStyle: motorColour, strokeStyle: '#2E2B44', lineWidth: 1}
            });

            // Back motor
            let motorBack = Bodies.rectangle(xPos + motorOffset[2].x, yPos + motorOffset[2].y, motorWidth, motorHeight, {
                collisionFilter: { group: group },
                frictionAir: 0.1, 
                render: { fillStyle: motorColour, strokeStyle: '#2E2B44', lineWidth: 1}
            });
            
            // Left motor attachment point A
            let attachLeftA = Constraint.create({
                bodyA: motorLeft,
                pointA: {
                    x: 0, 
                    y: motorHeight/2
                },
                bodyB: body,
                pointB: { 
                    x: motorOffset[0].x - ((motorHeight/2) * Math.sin(30*degToRad)), 
                    y: motorOffset[0].y + ((motorHeight/2) * Math.cos(30*degToRad))
                },
                stiffness: 1,
                length: 0,
                render: { lineWidth: 0 }
            });

            // Left motor attachment point B
            let attachLeftB = Constraint.create({
                bodyA: motorLeft,
                pointA: {
                    x: 0, 
                    y: -motorHeight/2
                },
                bodyB: body,
                pointB: { 
                    x: motorOffset[0].x + ((motorHeight/2) * Math.sin(30*degToRad)), 
                    y: motorOffset[0].y - ((motorHeight/2) * Math.cos(30*degToRad))
                },
                stiffness: 1,
                length: 0,
                render: { lineWidth: 0 }
            });

            // Right motor attachment point A
            let attachRightA = Constraint.create({
                bodyA: motorRight,
                pointA: {
                    x: 0, 
                    y: -motorHeight/2
                },
                bodyB: body,
                pointB: { 
                    x: motorOffset[1].x + ((motorHeight/2) * Math.sin(150*degToRad)), 
                    y: motorOffset[1].y - ((motorHeight/2) * Math.cos(150*degToRad))
                },
                stiffness: 1,
                length: 0,
                render: { lineWidth: 0 }
            });

            // Right motor attachment point B
            let attachRightB = Constraint.create({
                bodyA: motorRight,
                pointA: {
                    x: 0, 
                    y: motorHeight/2
                },
                bodyB: body,
                pointB: { 
                    x: motorOffset[1].x - ((motorHeight/2) * Math.sin(150*degToRad)), 
                    y: motorOffset[1].y + ((motorHeight/2) * Math.cos(150*degToRad))
                },
                stiffness: 1,
                length: 0,
                render: { lineWidth: 0 }
            });

            // Back motor attachment point A
            let attachBackA = Constraint.create({
                bodyA: motorBack,
                pointA: {
                    x: 0, 
                    y: motorHeight/2
                },
                bodyB: body,
                pointB: { 
                    x: motorOffset[2].x + motorHeight/2, 
                    y: motorOffset[2].y
                },
                stiffness: 1,
                length: 0,
                render: { lineWidth: 0 }
            });

            // Back motor attachment point B
            let attachBackB = Constraint.create({
                bodyA: motorBack,
                pointA: {
                    x: 0, 
                    y: -motorHeight/2
                },
                bodyB: body,
                pointB: { 
                    x: motorOffset[2].x - motorHeight/2, 
                    y: motorOffset[2].y
                },
                stiffness: 1,
                length: 0,
                render: { lineWidth: 0 }
            });
            
            // Form the composite body
            Composite.addBody(robot, body);
            Composite.addBody(robot, motorLeft);
            Composite.addBody(robot, motorRight);
            Composite.addBody(robot, motorBack);
            Composite.addConstraint(robot, attachLeftA);
            Composite.addConstraint(robot, attachLeftB);
            Composite.addConstraint(robot, attachRightA);
            Composite.addConstraint(robot, attachRightB);
            Composite.addConstraint(robot, attachBackA);
            Composite.addConstraint(robot, attachBackB);
    
            // Set attributes
            this.body = robot;
            this.prevAngle = this.getAngle();
            this.setupMotors(motorOffset);

            // Rotate entire composite shape if blue team
            if (team == 'blue'){
                Composite.rotate(this.body,180*degToRad,{x: xPos, y: yPos});
            }
        }

        // 3 motors equally spaced around pitch circle diameter
        setupMotors(offset){
            this.numMotors = 3;
            this.motorSpeeds.push(0,0,0);
            this.motorOffsets.push(offset[0],offset[1],offset[2]);
            this.forces.push({fx: 0, fy:0},{fx: 0, fy:0},{fx: 0, fy:0});
        }

        // Set speed of the one motor
        setMotorSpeed(motorNum, speed){
            if (motorNum < this.numMotors){
                this.motorSpeeds[motorNum] = speed;
            }
            this.calculateForce();
        }
        
        // Set speed of all motors
        setMotorSpeedAll(speed0, speed1, speed2){
            this.motorSpeeds[0] = speed0;
            this.motorSpeeds[1] = speed1;
            this.motorSpeeds[2] = speed2;
            this.calculateForce();
        }

        // Override for TriBot, adjusted for individual motor directions
        getDirectionVector(motor){
            let angle = this.body.bodies[motor+1].angle,
                x = Math.sin(angle),
                y = Math.cos(angle);
            return {x: x, y: y};
        }

        // Calculate relative force for dual motors
        calculateForce(){
            let forces = [],
                motorBodies = this.getMotors(),
                direction;
            // Calculate relative forces of all motors
            for (var i = 0; i < this.numMotors; i++){
                direction = this.getDirectionVector(i);
                let absF = (this.motorSpeeds[i])/100,
                // Relative forces are calculated based on direction vector
                    relFx = -1 * absF * direction.x,
                    relFy = absF * direction.y;
                // Increase friction for non-active motors
                if (this.motorSpeeds[i] == 0) {
                    motorBodies[i].frictionAir = 0.8;
                } else {
                    motorBodies[i].frictionAir = 0.1;
                }
                forces.push({
                    fx: relFx, 
                    fy: relFy
                });
            }
            this.forces = forces;
        }

        // update force applied to robot per time tick
        updateForce(){
            // Only recalculate forces on tick if enough bearing change
            if (this.checkChange() == true){
                this.calculateForce();
            }
            let forces = this.forces,
                vector = {},
                motor;
            // Continuously apply a force as long as motors are active
            for (var i = 0; i < this.numMotors; i++){
                vector = {x: forces[i].fx, y: forces[i].fy};
                motor = this.getMotors()[i];
                Body.applyForce(motor, motor.position, vector);
            }
        }
    }
    
    // TODO: move this to another file
    let title = document.getElementsByTagName("title")[0].innerHTML;

    // Define robots on the field
    let one = new DualBot('blue',200, 600),
    two = new TriBot('blue',350, 600);

    let robots = [one, two];
    window.One = one;
    window.Two = two;

    // define the ball
    let ball = Bodies.circle(fieldWidth/2, fieldHeight/2, 10, {
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