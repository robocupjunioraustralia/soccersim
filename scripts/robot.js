;(function(Matter) {
    "use strict";
    // Matter-js libraries
    var Body = Matter.Body,
        Composite = Matter.Composite,
        Vector = Matter.Vector;

    var degToRad = Math.PI / 180,
        radToDeg = 180 / Math.PI,
        angleLimit = 0.01;
    
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
            this.fieldWidth = fieldWidth;
            this.fieldHeight = fieldHeight;

            // Colours
            this.yellow = '#ffff00';
            this.blue = '#0000ff';
            this.white = '#ffffff';
            this.black = '#000000';
        }

        /*     ----     Methods that apply to all robots      ----      */

        // Turn given relative positions into absolute positions on the field
        // If reverse is true, turn absolute positions into relative positions
        adjustPos(team, xPos, yPos, reverse = false){
            // Adjust x and y pos to be relative to team origin points
            if (team == 'yellow'){
                xPos = -xPos + this.fieldWidth/2;
            } else {
                xPos = (reverse === false) ? xPos + this.fieldWidth/2 : xPos - this.fieldWidth/2;
                yPos = -yPos + this.fieldHeight;
            }
            return {x: xPos, y: yPos};
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

        // Manually apply motor array
        setMotorArray(array){
            this.motorSpeeds = array;
            this.calculateForce();
        }

        // Set the robot main body centroid position
        setPos(xPos, yPos){
            // Stop robot motion
            let previous = this.stopMovement();
            // Adjust position coordinates to absolute
            let absPos = this.adjustPos(this.team, xPos, yPos);

            // Set rotation to 0
            Composite.rotate(this.body, -this.getBearing(), absPos);

            // Set position to the desired point
            Body.setPosition(this.body.bodies[0], absPos);

            // Set position of attatched objects
            let motors = this.getMotors();
            for (let m in motors) {
                let motorPos = {
                    x: absPos.x + this.motorOffsets[m].x,
                    y: absPos.y + this.motorOffsets[m].y
                };
                if (this.team === 'blue') {
                    motorPos = Vector.rotateAbout(motorPos, Math.PI, absPos);
                }
                Body.setPosition(motors[m], motorPos);
            }
            
            // Return copy of previous motor speeds
            return previous;
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

        // Stop movement of the robot, returning its original motorspeeds
        stopMovement(){
            console.error('Please overwrite stopMovement');
        }
        
        // Update force per tick
        updateForce(){
            console.error('Please overwrite updateForce');
        }
    }

    window.Robot = Robot;
})(Matter);