;(function(Matter) {

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
            
            // add bodies
            World.add(this.world, robots.concat([
                this.ball,

                // walls
                Bodies.rectangle(546/2, 0, 546, 50, { isStatic: true }),
                Bodies.rectangle(546/2, 729, 546, 50, { isStatic: true }),
                Bodies.rectangle(546, 729/2, 50, 729, { isStatic: true }),
                Bodies.rectangle(0, 729/2, 50, 729, { isStatic: true })
            ]));

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

    // TODO: move this to another file
    let title = document.getElementsByTagName("title")[0].innerHTML;
    console.log(title);
    if (title === 'Matter.js Demo') {
        let robots = [
            // TODO: create actual robots
            Bodies.rectangle(100, 100, 50, 50, {
                frictionAir: 0.1
            }),
            Bodies.rectangle(100, 300, 50, 50, {
                frictionAir: 0.1
            }),
            Bodies.rectangle(400, 100, 50, 50, {
                frictionAir: 0.1
            }),
            Bodies.rectangle(400, 300, 50, 50, {
                frictionAir: 0.1
            })
        ];
        let ball = Bodies.circle(300, 100, 10, {
            frictionAir: 0.1,
            render: {
                fillStyle: '#f95a00'
            }
        });
        window.Example = window.Example || {};
        window.Example.soccer = function() {
            var sim = new SoccerSim(robots, ball);
            return sim.demo();
        };
    }
})(Matter);