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

    // Bot with single motor in the centre, can only move forwards and back
    class OneBot extends Robot{
        constructor(x, y) {
            super(x, y);
            this.setupMotors();
        }

        // Single motor in the centre
        setupMotors(){
            this.motors.push(0);
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
            let angle = this.getBearing();
            let relFx = -1 * absF * Math.sin(angle);
            let relFy = absF * Math.cos(angle);
            forces.push({
                fx: relFx, 
                fy: relFy, 
                from: mPos
            });
            return forces;
        }
    }

    // Single motor robot, very not complete
    class TwoRobot extends Robot{
        constructor(x, y) {
            super(x, y);
            this.setupMotors();
        }

        setupMotors(){
            this.motors.push(0,0);
            this.motorPos.push({x:0, y:50},{x:0, y:-50});
        }

        updateForce(){
            let mp = this.getMotorPos(0);
            let f = {x: this.fx, y: this.fy};
            Body.applyForce(this.body, {x: (mp.x+this.x), y: (mp.y+this.y)}, f);
        }

        setMotorSpeed(motorNum, speed){
            if (motorNum < this.motors.length){
                this.motors[motorNum] = speed;
            }
            this.calculateForce();
        }

        setMotorSpeeds(array){
            for (var i = 0; i < array.length; i++){
                this.setMotorSpeed(array[i].motorNum, array[i].speed);
            }
        }

        calculateForce(){
            this.fx = (this.motors[0])/100;
        }
    }

    // TODO: move this to another file
    let title = document.getElementsByTagName("title")[0].innerHTML;

    // Print title of the browser tab
    console.log(title);
    if (title === 'Matter.js Demo') {
        // Define robots on the field
        let one = new OneBot(100,100);
        // let two = new TwoRobot(100,300);
        // let three = new OneBot(400,100);
        // let four = new OneBot(400,300);
        let robots = [one];
        // [one, two, three, four];
        console.log(one);
        window.robotOne = one;
        // window.robotTwo = two;
        // console.log(two);

        // define the ball
        let ball = Bodies.circle(300, 100, 10, {
            frictionAir: 0.1,
            render: {fillStyle: '#f95a00'}
        });

        // Create a new simulation if selected
        window.Example = window.Example || {};
        window.Example.soccer = function() {
            var sim = new SoccerSim(robots, ball);
            return sim.demo();
        };
    }
})(Matter);