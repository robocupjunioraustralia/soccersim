;(function(Matter, Robot) {
    "use strict";

    if (!Matter || !Robot) {
        console.warn('Dependencies not found.');
    }

    var Body = Matter.Body,
        Composite = Matter.Composite,
        Constraint = Matter.Constraint,
        Bodies = Matter.Bodies;

    class DualBot extends Robot {
        // TODO: currently contains hardcoding of bot and motor dimensions/position
        /**
         * Bot with 2 motors, one on each side. Can move forwards and back, as well as turn and spin
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
            this.type = 'DualBot';
            this.createBot(team, x, y, 40, 40, 5, 20);
        }
        // Create a square robot with wheels on either side
        createBot(team, xPos, yPos, bodyWidth, bodyHeight, motorWidth, motorHeight){
            // Adjust position coordinates to absolute
            let absPos = this.adjustPos(team, xPos, yPos);
            xPos = absPos.x;
            yPos = absPos.y;

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
                bodyColour = this.blue;
                motorColour = this.white;
            } else {
                bodyColour = this.yellow;
                motorColour = this.white;
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
                stiffness: 0.7,
                length: 0,
                render: { lineWidth: 0 }
            });

            // Left motor attachment point B
            let attachLeftB = Constraint.create({
                bodyA: motorLeft,
                pointA: {x: 0, y: -motorHeight/2},
                bodyB: body,
                pointB: { x: motorOffset[0].x, y: -motorHeight/2 },
                stiffness: 0.7,
                length: 0,
                render: { lineWidth: 0 }
            });

            // Right motor attachment point A
            let attachRightA = Constraint.create({
                bodyA: motorRight,
                pointA: {x: 0, y: motorHeight/2},
                bodyB: body,
                pointB: { x: motorOffset[1].x, y: motorHeight/2 },
                stiffness: 0.7,
                length: 0,
                render: { lineWidth: 0 }
            });

            // Right motor attachment point B
            let attachRightB = Constraint.create({
                bodyA: motorRight,
                pointA: {x: 0, y: -motorHeight/2},
                bodyB: body,
                pointB: { x: motorOffset[1].x, y: -motorHeight/2 },
                stiffness: 0.7,
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
            this.pos = this.getPos();

            // Rotate entire composite shape if blue team
            if (team == 'blue'){
                Composite.rotate(this.body, Math.PI, {x: xPos, y: yPos});
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
                const clone = [...this.motorSpeeds];
                clone[motorNum] = speed;
                this.motorSpeeds = clone;
            }
            this.calculateForce();
        }
        
        // Set speed of both motors
        setMotorSpeedAll(speed0, speed1){
            this.motorSpeeds = [speed0, speed1];
            this.calculateForce();
        }

        // Stop movement of the robot, returning its original motorspeeds
        stopMovement(){
            let previous = this.getMotorSpeeds().slice();
            this.setMotorSpeedAll(0,0);
            return previous;
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
            this.pos = this.getPos();
        }

    }

    window.DualBot = DualBot;
})(Matter, Robot);