;(function(Matter, Robot) {
    "use strict";

    if (!Matter || !Robot) {
        console.warn('Dependencies not found.');
    }

    // Matter-js libraries
    var Body = Matter.Body,
    Composite = Matter.Composite,
    Constraint = Matter.Constraint,
    Bodies = Matter.Bodies;
    
    var degToRad = Math.PI/180;

    class UniBot extends Robot {
        /**
        * Bot with single motor in the centre, can only move forwards and back
        * @param {*} team team colour
        * @param {*} x initial position along the x axis
        * @param {*} y initial position along the y axis
        * @param {dribbler} dribbler pair of forks on front of robot to 'catch' ball
        */
        constructor(team, x, y, fieldWidth, fieldHeight) {
            super(team);
            this.dribbler = {
                height: 4,
                width: 5,
                offset: 12
            };
            this.type = 'UniBot';
            this.createBot(team, x, y, 40, 40, 10, 25);
        }
        
        // Create a square robot with wheel in the centre
        createBot(team, xPos, yPos, bodyWidth, bodyHeight, motorWidth, motorHeight) {
            // Adjust position coordinates to absolute
            let absPos = this.adjustPos(team, xPos, yPos);
            xPos = absPos.x;
            yPos = absPos.y;
            
            // Define a group of parts that won't collide with each other
            let group = Body.nextGroup(true),
            motorOffset = {
                x: 0,
                y: 0
            },
            bodyColour,
            motorColour;
            
            // Define colours for each team
            if (team == 'blue') {
                bodyColour = this.blue;
                motorColour = this.white;
            } else {
                bodyColour = this.yellow;
                motorColour = this.black;
            }
            
            // Create an empty composite, the dribbler catch posts and centre body
            let robot = Composite.create({
                label: 'UniBot'
            }),
            dribblerA = Bodies.rectangle(xPos + this.dribbler.offset, yPos + bodyHeight / 2 + this.dribbler.height / 2, this.dribbler.width, this.dribbler.height, {
                render: {
                    fillStyle: bodyColour,
                    strokeStyle: '#2E2B44',
                    lineWidth: 1
                }
            }),
            dribblerB = Bodies.rectangle(xPos - this.dribbler.offset, yPos + bodyHeight / 2 + this.dribbler.height / 2, this.dribbler.width, this.dribbler.height, {
                render: {
                    fillStyle: bodyColour,
                    strokeStyle: '#2E2B44',
                    lineWidth: 1
                }
            }),
            centre = Bodies.rectangle(xPos, yPos, bodyWidth, bodyHeight, {
                render: {
                    fillStyle: bodyColour,
                    strokeStyle: '#2E2B44',
                    lineWidth: 1
                },
            });
            
            // merge parts into single robot body
            let body = Body.create({
                collisionFilter: {
                    group: group
                },
                frictionAir: 0.1,
                parts: [centre, dribblerA, dribblerB]
            });
            
            // central motor
            let motor = Bodies.rectangle(xPos + motorOffset.x, yPos + motorOffset.y, motorWidth, motorHeight, {
                collisionFilter: {
                    group: group
                },
                frictionAir: 0.1,
                render: {
                    fillStyle: motorColour,
                    strokeStyle: '#2E2B44',
                    lineWidth: 1
                }
            });
            
            // Motor attach point A
            let attachA = Constraint.create({
                bodyA: motor,
                pointA: {
                    x: 0,
                    y: motorHeight / 2
                },
                bodyB: body,
                pointB: {
                    x: motorOffset.x,
                    y: motorHeight / 2
                },
                stiffness: 0.7,
                length: 0
            });
            
            // Motor attach point B
            let attachB = Constraint.create({
                bodyA: motor,
                pointA: {
                    x: 0,
                    y: -motorHeight / 2
                },
                bodyB: body,
                pointB: {
                    x: motorOffset.x,
                    y: -motorHeight / 2
                },
                stiffness: 0.7,
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
            if (team == 'blue') {
                Composite.rotate(this.body, 180 * degToRad, {
                    x: xPos,
                    y: yPos
                });
            }
        }
        
        // Single motor in the centre
        setupMotors(offset) {
            this.numMotors = 1;
            this.motorSpeeds.push(0);
            this.motorOffsets.push(offset);
            this.forces.push({
                fx: 0,
                fy: 0
            });
        }
        
        // Set speed of the single motor regardless of motorNum
        setMotorSpeed(motorNum, speed) {
            this.motorSpeeds[0] = speed;
            this.calculateForce();
        }
        
        // Stop movement of the robot, returning its original motorspeeds
        stopMovement() {
            let previous = this.getMotorSpeeds().slice();
            this.setMotorSpeed(0, 0);
            // Body.setStatic(this.body.bodies[0],true)
            return previous;
        }
        
        // Calculate relative force for single motor
        calculateForce() {
            let forces = [],
            absF = (this.motorSpeeds[0]) / 100,
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
        updateForce() {
            if (this.checkChange() == true) {
                this.calculateForce();
            }
            let forces = this.forces,
            vector = {
                x: forces[0].fx,
                y: forces[0].fy
            },
            motor = this.getMotors()[0];
            Body.applyForce(motor, motor.position, vector);
        }
    }

    window.UniBot = UniBot;
})(Matter, Robot);