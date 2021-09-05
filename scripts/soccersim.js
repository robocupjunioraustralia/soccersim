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
    const degToRad = Math.PI/180;
    const radToDeg = 180/Math.PI;
    const yellow = '#EFCF00';
    const blue = '#00C1FF';
    const white = '#ffffff';
    const black = '#000000';
    const angleLimit = 0.01;
    const FIELDCOLOR = '#366f0b';
    const PENALTYTHICKNESS = 7;
    const BOUNDARYTHICKNESS = 14;
    const GOALTHICKNESS = 5;
    const GOALAREAHEIGHT = 15;
    const NEUTRALPOINTSIZE = 4;
    
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
                    showVelocity: false,
                    wireframes: false
                }
            });

            Render.run(this.render);

            // create runner
            this.runner = Runner.create();
            this.runner.isFixed = true;
            Runner.run(this.runner, this.engine);

            // Field markings and objects array
            let field = this.createFieldObjects();
            let fieldObjects = field.main;
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
                render: { fillStyle: FIELDCOLOR }
            });

            // Create markings body
            const markings = function() {
                const boundaryOptions = {isSensor: true, render: {fillStyle : white}};
                const topBoundary = Bodies.rectangle(fieldWidth/2, 0.1 * fieldHeight, 0.74*fieldWidth, BOUNDARYTHICKNESS, {...boundaryOptions, chamfer: {radius: 7}});
                const bottomBoundary = Bodies.rectangle(fieldWidth/2, 0.9 * fieldHeight, 0.74*fieldWidth, BOUNDARYTHICKNESS, {...boundaryOptions, chamfer: {radius: 7}});
                const rightBoundary = Bodies.rectangle(0.86*fieldWidth, fieldHeight/2, BOUNDARYTHICKNESS, 0.81*fieldHeight, {...boundaryOptions, chamfer: {radius: 7}});
                const leftBoundary = Bodies.rectangle(0.14*fieldWidth, fieldHeight/2, BOUNDARYTHICKNESS, 0.81*fieldHeight, {...boundaryOptions, chamfer: {radius: 7}});
                return Body.create({parts: [topBoundary,bottomBoundary,leftBoundary,rightBoundary], isSensor: true, isStatic: true});
            }();
            
            
            // Penalty areas
            const {topPenalty, bottomPenalty} = function() {
                const penaltyOptions = {isSensor: true, render: {fillStyle : black}};
                const topPenaltyBottom = Bodies.rectangle(fieldWidth/2, 0.77 * fieldHeight, 0.51*fieldWidth, PENALTYTHICKNESS, {...penaltyOptions, chamfer: {radius: 3}});
                const topPenaltyRight = Bodies.rectangle(0.75*fieldWidth, 0.835*fieldHeight, PENALTYTHICKNESS, 0.135*fieldHeight, {...penaltyOptions, chamfer: {radius: 3}});
                const topPenaltyLeft = Bodies.rectangle(0.25*fieldWidth, 0.835*fieldHeight, PENALTYTHICKNESS, 0.135*fieldHeight, {...penaltyOptions, chamfer: {radius: 3}});
    
                const bottomPenaltyTop = Bodies.rectangle(fieldWidth/2, 0.23 * fieldHeight, 0.51*fieldWidth, PENALTYTHICKNESS, {...penaltyOptions, chamfer: {radius: 3}});
                const bottomPenaltyRight = Bodies.rectangle(0.75*fieldWidth, 0.165*fieldHeight, PENALTYTHICKNESS, 0.135*fieldHeight, {...penaltyOptions, chamfer: {radius: 3}});
                const bottomPenaltyLeft = Bodies.rectangle(0.25*fieldWidth, 0.165*fieldHeight, PENALTYTHICKNESS, 0.135*fieldHeight, {...penaltyOptions, chamfer: {radius: 3}});
                
                const penaltyBodyOptions = {isSensor: true, isStatic: true};
                const topPenalty = Body.create({parts: [topPenaltyBottom,topPenaltyLeft,topPenaltyRight], ...penaltyBodyOptions});
                const bottomPenalty = Body.create({parts: [bottomPenaltyTop,bottomPenaltyLeft,bottomPenaltyRight], ...penaltyBodyOptions});
                return {topPenalty, bottomPenalty};
            }();
            

            // Goal side posts
            const {topGoalPost, bottomGoalPost} = function() {
                const goalPostOptions = {render: {fillStyle : black}};
                const rightTopGoalPost = Bodies.rectangle(0.62*fieldWidth, 0.91*fieldHeight, GOALTHICKNESS, 0.04*fieldHeight, goalPostOptions);
                const leftTopGoalPost = Bodies.rectangle(0.38*fieldWidth, 0.91*fieldHeight, GOALTHICKNESS, 0.04*fieldHeight, goalPostOptions);
                const topGoalPost = Body.create({parts: [leftTopGoalPost,rightTopGoalPost], isStatic: true});
    
                const rightBottomGoalPost = Bodies.rectangle(0.62*fieldWidth, 0.09*fieldHeight, GOALTHICKNESS, 0.04*fieldHeight, goalPostOptions);
                const leftBottomGoalPost = Bodies.rectangle(0.38*fieldWidth, 0.09*fieldHeight, GOALTHICKNESS, 0.04*fieldHeight, goalPostOptions);
                const bottomGoalPost = Body.create({parts: [leftBottomGoalPost,rightBottomGoalPost], isStatic: true});
                return {topGoalPost, bottomGoalPost};
            }();

            // Goal back posts
            const {blueGoal, yellowGoal} = function() {
                const goalBackOptions = {isStatic:true, render: {fillStyle : black}};
                const blueGoal = Bodies.rectangle(fieldWidth/2, 0.07 * fieldHeight, 0.248*fieldWidth, GOALTHICKNESS, goalBackOptions);
                const yellowGoal = Bodies.rectangle(fieldWidth/2, 0.93 * fieldHeight, 0.248*fieldWidth, GOALTHICKNESS, goalBackOptions);
                return {blueGoal, yellowGoal};
            }();

            // Goal areas
            const {blueArea, yellowArea} = function() {
                const goalAreaOptions = {isStatic: true, isSensor:true};
                const yellowArea = Bodies.rectangle(fieldWidth/2, 0.92 * fieldHeight, 0.24*fieldWidth, GOALAREAHEIGHT, {...goalAreaOptions, render: {fillStyle : yellow}});
                const blueArea = Bodies.rectangle(fieldWidth/2, 0.08 * fieldHeight, 0.24*fieldWidth, GOALAREAHEIGHT, {...goalAreaOptions, render: {fillStyle : blue}});
                return {blueArea, yellowArea};
            }();

            // Black dots
            const {dotOne, dotTwo, dotThree} = function() {
                const neutralPointOptions = {isStatic: true, isSensor: true, render: {fillStyle : black}};
                const dotOne = Bodies.circle(fieldWidth/2, fieldHeight/2, NEUTRALPOINTSIZE, neutralPointOptions);
                const dotTwo = Bodies.circle(0.33*fieldWidth, fieldHeight/2, NEUTRALPOINTSIZE, neutralPointOptions);
                const dotThree = Bodies.circle(0.66*fieldWidth, fieldHeight/2, NEUTRALPOINTSIZE, neutralPointOptions);
                return {dotOne, dotTwo, dotThree};
            }();
            
            const fieldObjects = [
                field,
                topPenalty, bottomPenalty,
                yellowArea, blueArea,
                yellowGoal, blueGoal,
                markings,
                topGoalPost, bottomGoalPost,
                dotOne, dotTwo, dotThree
            ];
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