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
         * @param {Number} fieldWidth
         * * @param {Number} fieldHeight
         */
        constructor(element, robots, ball, fieldWidth, fieldHeight) {
            this.engine = Engine.create();
            this.world = this.engine.world;
            this.robots = robots;
            this.ball = ball;
            this.fieldWidth = fieldWidth;
            this.fieldHeight = fieldHeight;

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
            this.runner.isFixed = true;
            Runner.run(this.runner, this.engine);

            // Field markings and objects array
            let field = this.createFieldObjects(),
                fieldObjects = field.main;
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
            let self = this;
            Events.on(this.engine, 'beforeUpdate', function (event) {
                for (var i = 0; i < self.robots.length; i++){
                    self.robots[i].updateForce();
                }
            });

            // Setup attributes for goal detection
            this.yellowGoal = field.goals.yellow;
            this.blueGoal = field.goals.blue;
            this.goalAreas = field.areas;
            this.goalFlag = false;
        }

        // Create all elements of the playing field
        createFieldObjects(){

            // Create field
            let field = Matter.Bodies.rectangle(this.fieldWidth/2, this.fieldHeight/2, this.fieldWidth, this.fieldHeight, {
                collisionFilter: {
                    group: -1,
                    category: 2,
                    mask: 0,
                },
                render: { fillStyle: '#366f0b'}
            });

            // Create markings body
            let top = Bodies.rectangle(this.fieldWidth/2, 0.1 * this.fieldHeight, 0.74*this.fieldWidth, 14, {isSensor: true, render: {fillStyle : white}}),
            bottom = Bodies.rectangle(this.fieldWidth/2, 0.9 * this.fieldHeight, 0.74*this.fieldWidth, 14, {isSensor: true, render: {fillStyle : white}}),
                right = Bodies.rectangle(0.86*this.fieldWidth, this.fieldHeight/2, 14, 0.81*this.fieldHeight, {isSensor: true, render: {fillStyle : white}}),
                left = Bodies.rectangle(0.14*this.fieldWidth, this.fieldHeight/2, 14, 0.81*this.fieldHeight, {isSensor: true, render: {fillStyle : white}}),
                markings = Body.create({parts: [top,bottom,left,right], isSensor: true, isStatic: true});
            
            // Penalty areas
            bottom = Bodies.rectangle(this.fieldWidth/2, 0.77 * this.fieldHeight, 0.5*this.fieldWidth, 7, {isSensor: true, render: {fillStyle : black}});
            right = Bodies.rectangle(0.75*this.fieldWidth, 0.84*this.fieldHeight, 7, 0.14*this.fieldHeight, {isSensor: true, render: {fillStyle : black}});
            left = Bodies.rectangle(0.25*this.fieldWidth, 0.84*this.fieldHeight, 7, 0.14*this.fieldHeight, {isSensor: true, render: {fillStyle : black}});
            let topPenalty = Body.create({parts: [bottom,left,right], isSensor: true, isStatic: true});

            top = Bodies.rectangle(this.fieldWidth/2, 0.23 * this.fieldHeight, 0.5*this.fieldWidth, 7, {isSensor: true, render: {fillStyle : black}});
            right = Bodies.rectangle(0.75*this.fieldWidth, 0.16*this.fieldHeight, 7, 0.14*this.fieldHeight, {isSensor: true, render: {fillStyle : black}});
            left = Bodies.rectangle(0.25*this.fieldWidth, 0.16*this.fieldHeight, 7, 0.14*this.fieldHeight, {isSensor: true, render: {fillStyle : black}});
            let bottomPenalty = Body.create({parts: [top,left,right], isSensor: true, isStatic: true});

            // Goal side posts
            right = Bodies.rectangle(0.62*this.fieldWidth, 0.91*this.fieldHeight, 4, 0.04*this.fieldHeight, {render: {fillStyle : black}});
            left = Bodies.rectangle(0.38*this.fieldWidth, 0.91*this.fieldHeight, 4, 0.04*this.fieldHeight, {render: {fillStyle : black}});
            let topGoalPost = Body.create({parts: [left,right], isStatic: true});

            right = Bodies.rectangle(0.62*this.fieldWidth, 0.09*this.fieldHeight, 4, 0.04*this.fieldHeight, {render: {fillStyle : black}});
            left = Bodies.rectangle(0.38*this.fieldWidth, 0.09*this.fieldHeight, 4, 0.04*this.fieldHeight, {render: {fillStyle : black}});
            let bottomGoalPost = Body.create({parts: [left,right], isStatic: true});

            // Goal back posts
            let blueGoal = Bodies.rectangle(this.fieldWidth/2, 0.07 * this.fieldHeight, 0.25*this.fieldWidth, 4, {isStatic:true, render: {fillStyle : black}});
            let yellowGoal = Bodies.rectangle(this.fieldWidth/2, 0.93 * this.fieldHeight, 0.25*this.fieldWidth, 4, {isStatic:true, render: {fillStyle : black}});

            // Goal areas
            let yellowArea = Bodies.rectangle(this.fieldWidth/2, 0.92 * this.fieldHeight, 0.24*this.fieldWidth, 14, {isStatic: true, isSensor:true,render: {fillStyle : yellow}});
            let blueArea = Bodies.rectangle(this.fieldWidth/2, 0.08 * this.fieldHeight, 0.24*this.fieldWidth, 14, {isStatic: true, isSensor: true, render: {fillStyle : blue}});

            // Black dots
            let dotOne = Bodies.circle(this.fieldWidth/2, this.fieldHeight/2, 4, {isStatic: true, isSensor: true, render: {fillStyle : black}}),
                dotTwo = Bodies.circle(0.33*this.fieldWidth, this.fieldHeight/2, 4, {isStatic: true, isSensor: true, render: {fillStyle : black}}),
                dotThree = Bodies.circle(0.66*this.fieldWidth, this.fieldHeight/2, 4, {isStatic: true, isSensor: true, render: {fillStyle : black}});
            
            let fieldObjects = [field, topPenalty, bottomPenalty, yellowArea, blueArea, yellowGoal, blueGoal, markings, topGoalPost, bottomGoalPost, dotOne, dotTwo, dotThree];
            return {
                main: fieldObjects, 
                goals: {
                    yellow: yellowGoal, 
                    blue: blueGoal
                }, 
                areas: {
                    yellow: yellowArea, 
                    blue: blueArea
                }
            };
        }

        // Goal detection wrapper
        detectGoals(callback){
            let self = this;
            let goalAreas = self.goalAreas;
            // If in a goal area or hit back of goal
            Events.on(this.engine, 'collisionStart', function(event) {
                let pairs = event.pairs;
                for (let i = 0, j = pairs.length; i != j; ++i) {
                    let pair = pairs[i];
                    // Check colliding object contains the ball
                    if (pair.bodyA === self.ball || pair.bodyB === self.ball){
                        // Check if goal flag is already set
                        if (self.goalFlag == false){
                            if (pair.bodyA === goalAreas.yellow || pair.bodyB === goalAreas.yellow) {
                                self.goalFlag = true;
                            } else if (pair.bodyA === goalAreas.blue || pair.bodyB === goalAreas.blue) {
                                self.goalFlag = true;
                            }
                        // If goal flag is set, check if hitting back of a goal
                        } else {
                            if (pair.bodyA === self.blueGoal || pair.bodyB === self.blueGoal) {
                                callback('blue');
                            } else if (pair.bodyA === self.yellowGoal || pair.bodyB === self.yellowGoal) {
                                callback('yellow');
                            }
                        }
                    }
                }
            });

            // If moved out of goal area, reset flag
            Events.on(this.engine, 'collisionEnd', function(event) {
                let pairs = event.pairs;
                for (let i = 0, j = pairs.length; i != j; ++i) {
                    let pair = pairs[i];
                    // Check collision object contains ball
                    if (pair.bodyA === self.ball || pair.bodyB === self.ball){
                        if (pair.bodyA === goalAreas.yellow || pair.bodyB === goalAreas.yellow) {
                            self.goalFlag = false;
                        } else if (pair.bodyA === goalAreas.blue || pair.bodyB === goalAreas.blue) {
                            self.goalFlag = false;
                        }
                    }
                }
            });
        }

        // Removes a bot and returns its original position
        removeBot(robot){
            let position = robot.adjustPos(robot.team, robot.body.bodies[0].position.x, robot.body.bodies[0].position.y, true);
            this.robots = this.robots.filter(function(bot) {
                return bot != robot;
            });
            World.remove(this.world, robot.body);
            return position;
        }

        // Adds a bot to a specific position
        addBot(robot, pos, team){
            let add = null;
            if (team === 'blue'){
                if (robot === 'DualBot'){
                    add = new DualBot('blue', pos.x, pos.y, fieldWidth, fieldHeight);
                } else if (robot === 'TriBot'){
                    add = new TriBot('blue', pos.x, pos.y, fieldWidth, fieldHeight);
                }
            } else if (team === 'yellow'){
                if (robot === 'DualBot'){
                    add = new DualBot('yellow', pos.x, pos.y, fieldWidth, fieldHeight);
                } else if (robot === 'TriBot'){
                    add = new TriBot('yellow', pos.x, pos.y, fieldWidth, fieldHeight);
                }
            }
            this.robots.push(add);
            World.add(this.world, add.body);
            return add;
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
    
    window.SoccerSim = SoccerSim;

})(Matter);