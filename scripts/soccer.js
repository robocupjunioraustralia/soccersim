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
        Bodies = Matter.Bodies;
    
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
                // TODO: loop through this.robots and call its update function
                // The update function should apply some provided forces to the
                // wheels of a robot.
                for (var i = 0; i < bots.length; i++){
                    robots[i].updatePos();
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
         * @param {x} x is the x position of the robot
         * @param {y} y is the y position of the robot
         */
        constructor(x, y) {
            // Prevent instantiation of Robot class
            if (new.target === Robot) {
                throw new TypeError("Cannot instantiate abstract Robot class");
            }
            // Currently represented by a single rectangle
            this.body = Bodies.rectangle(x, y, 50, 50, {frictionAir: 0.1});
            this.id = this.body.id;
            this.motors = [];
            this.motorPos = [];
            this.motorOffsets = [];
            this.numMotors = 0;
        }

        // x and y components of unit vector pointing in robot's forward direction
        getRelative(){
            let angle = this.getBearing();
            let x = Math.sin(angle);
            let y = Math.cos(angle);
            return {sine: x, cosine: y};
        }

        // Remind self how many motors robot contains
        getNumMotors(){
            return this.numMotors;
        }

        // Get current centroid position
        getPos(){
            return this.body.position;
        }

        // Get bearing, in radians
        getBearing(){
            return this.body.angle;
        }

        // Get array of current motor speeds
        getMotors(){
            return this.motors;
        }

        // Getter for specific motor's x,y coordinates
        getMotorPos(index){
            return this.motorPos[index];
        }

        // Update motor position per tick
        updatePos(){
            console.error('Please overwrite updatePos');
        }

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
    }

    class UniBot extends Robot{
        // Bot with single motor in the centre, can only move forwards and back
        constructor(x, y) {
            super(x, y);
            this.setupMotors();
        }

        // Single motor in the centre
        setupMotors(){
            this.numMotors = 1;
            this.motors.push(0);
            this.motorOffsets.push({x:0, y:0});
            let centroid = this.getPos();
            this.motorPos.push({x: centroid.x, y: centroid.y});
        }

        // Update location of motors per time tick
        updatePos(){
            let centroid = this.getPos();
            this.motorPos[0].x = centroid.x;
            this.motorPos[0].y = centroid.y;
        }

        // update force applied to robot per time tick
        updateForce(){
            let forces = this.calculateForce();
            let vector = {x: forces[0].fx, y: forces[0].fy};
            Body.applyForce(this.body, forces[0].from, vector);
        }

        // Set speed of the one motor regardless of motorNum
        setMotorSpeed(motorNum, speed){
            this.motors[0] = speed;
            this.calculateForce();
        }

        // Calculate relative force for single motor
        calculateForce(){
            let forces = [];
            let mPos = this.motorPos[0];
            let absF = (this.motors[0])/100;
            let relative = this.getRelative();
            let relFx = -1 * absF * relative.sine;
            let relFy = absF * relative.cosine;
            forces.push({
                fx: relFx, 
                fy: relFy, 
                from: mPos
            });
            return forces;
        }
    }

    class DualBot extends Robot{
        // Bot with 2 motors, one on each side
        // Can move forwards and back, as well as turn and spin
        // TODO: currently contains hardcoding of motor position
        constructor(x, y) {
            super(x, y);
            this.setupMotors();
        }

        // One motor on either side, 2 total
        setupMotors(){
            this.numMotors = 2;
            this.motors.push(0,0);
            this.motorOffsets.push(
                {x: 25, y: 0},
                {x:-25, y: 0}
            );
            let offsets = this.motorOffsets;
            let centroid = this.getPos();
            this.motorPos.push(
                {x: centroid.x + offsets[0].x, y: centroid.y + offsets[0].y}, 
                {x: centroid.x + offsets[1].x, y: centroid.y + offsets[1].y}
            );
        }

        // Update location of motors per time tick
        updatePos(){
            let centroid = this.getPos();

            let relative = this.getRelative();
            let magnitude = 25;

            let relx = magnitude * relative.cosine;
            let rely = magnitude * relative.sine;

            this.motorPos[0].x = centroid.x + relx;
            this.motorPos[0].y = centroid.y + rely;

            this.motorPos[1].x = centroid.x - relx;
            this.motorPos[1].y = centroid.y - rely;
        }

        // update force applied to robot per time tick
        updateForce(){
            let forces = this.calculateForce();
            let vector = {};
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
            let forces = [];
            let relative = this.getRelative();

            for (var i = 0; i < this.numMotors; i++){
                let mPos = this.motorPos[i];
                let absF = (this.motors[i])/100;
                let relFx = -1 * absF * relative.sine;
                let relFy = absF * relative.cosine;
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
        let one = new UniBot(100,100);
        let two = new DualBot(100,300);
        let three = new UniBot(400,100);
        let four = new UniBot(400,300);
        let robots = [one, two, three, four];
        console.log(one);
        window.robotOne = one;
        window.robotTwo = two;
        console.log(two);

        // define the ball
        let ball = Bodies.circle(300, 100, 10, {
            frictionAir: 0.1,
            render: {fillStyle: '#f95a00'}
        });

        // Create a new simulation if selected
        window.Example = window.Example || {};
        window.Example.soccer = function() {
            var sim = new SoccerSim(document.body, robots, ball);
            return sim.demo();
        };
    } else {
        // Assume it is the actual interface
        // Define robots on the field
        let one = new UniBot(100,100);
        let two = new DualBot(100,300);
        let three = new UniBot(400,100);
        let four = new UniBot(400,300);
        let robots = [one, two, three, four];
        window.robotOne = one;
        window.robotTwo = two;

        // define the ball
        let ball = Bodies.circle(300, 100, 10, {
            frictionAir: 0.1,
            render: {fillStyle: '#f95a00'}
        });

        // Create a new simulation
        var sim = new SoccerSim(document.getElementById('matterjs'), robots, ball);
        // Engine.run(sim.engine);
        // Render.run(sim.render);
    }
})(Matter);