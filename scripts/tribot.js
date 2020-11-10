;(function(Matter, Robot) {
    "use strict";

    if (!Matter || !Robot) {
        console.warn('Dependencies not found.');
    }

    var Body = Matter.Body,
        Composite = Matter.Composite,
        Constraint = Matter.Constraint,
        Bodies = Matter.Bodies;

    class TriBot extends Robot{
        /**
         * Bot with three motors, 120 deg from each other. Motors defined in order of left, right, back
         * @param {*} team team colour
         * @param {*} x initial position along the x axis
         * @param {*} y initial position along the y axis
         */
        constructor(team, x, y, fieldWidth, fieldHeight) {
            super(team);
            this.type = 'TriBot';
            this.createBot(team, x, y, 4, 12);
        }

        // JQuery and AJAX to fetch SVG file of robot outline
        /*
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
                        // Print out the points
                        for (let i = 0; i < points.length; i++){
                            console.log(points[i]);
                        }
                    });
                });
                return vertices;
            }
        }
        */

        // Create a square robot with wheel in the centre
        createBot(team, xPos, yPos, motorWidth, motorHeight){
            // Adjust position coordinates to absolute
            let absPos = this.adjustPos(team, xPos, yPos);
            xPos = absPos.x;
            yPos = absPos.y;

            // Define a group of parts that won't collide with each other
            let group = Body.nextGroup(true),
                // In order of Left, Right, Back motors 
                motorOffset = [
                    {x: 16, y: 9},
                    {x: -16, y: 9},
                    {x: 0, y: -16}
                ],
                bodyColour,
                motorColour;
            
            // Define colours for each team
            if (team == 'blue'){
                bodyColour = this.blue;
                motorColour = this.white;
            } else {
                bodyColour = this.yellow;
                motorColour = this.black;
            }

            // Parse the SVG to create vertices
            // let svgName = 'TriBot',
            //     vertices = this.parseSVG(svgName);

            // Vertex results from parsingSVG
            let vertices = [
                { x: -160.5, y: -66.49999999999999 },
                { x: -160.44479370117188, y: -69.4993209838867 },
                { x: -160.2789764404297, y: -72.4945602416992 },
                { x: -160.001953125, y: -75.48155975341795 },
                { x: -159.61355590820312, y: -78.4561309814453 },
                { x: -159.11378479003906, y: -81.41403198242186 },
                { x: -158.50302124023438, y: -84.35101318359374 },
                { x: -157.7819061279297, y: -87.2628707885742 },
                { x: -156.9513702392578, y: -90.14542388916014 },
                { x: -156.01254272460938, y: -92.99454498291014 },
                { x: -154.966796875, y: -95.80618286132811 },
                { x: -153.8156280517578, y: -98.57633972167967 },
                { x: -152.56076049804688, y: -101.3010787963867 },
                { x: -151.20425415039062, y: -103.97667694091795 },
                { x: -149.74801635742188, y: -106.59932708740233 },
                { x: -148.1943817138672, y: -109.1654815673828 },
                { x: -146.545654296875, y: -111.67160034179686 },
                { x: -144.8042449951172, y: -114.11423492431639 },
                { x: -142.97280883789065, y: -116.49010467529295 },
                { x: -141.05387878417972, y: -118.79589080810545 },
                { x: -139.0503082275391, y: -121.02853393554686 },
                { x: -136.96482849121097, y: -123.18485260009764 },
                { x: -134.80046081542972, y: -125.26196289062499 },
                { x: -132.56008911132815, y: -127.25688171386717 },
                { x: -130.2469177246094, y: -129.16687011718747 },
                { x: -127.8639602661133, y: -130.98907470703122 },
                { x: -125.41461181640626, y: -132.72099304199216 },
                { x: -122.90208435058595, y: -134.35995483398435 },
                { x: -120.32996368408205, y: -135.90365600585935 },
                { x: -117.70159149169923, y: -137.34954833984372 },
                { x: -115.02075195312501, y: -138.69566345214844 },
                { x: -112.29111480712892, y: -139.93984985351562 },
                { x: -109.51645660400392, y: -141.0801239013672 },
                { x: -106.7007522583008, y: -142.1149139404297 },
                { x: -103.84798431396486, y: -143.04261779785156 },
                { x: -100.96218109130861, y: -143.86181640625 },
                { x: -98.04751586914064, y: -144.5714874267578 },
                { x: -95.10816955566408, y: -145.1707305908203 },
                { x: -92.14835357666017, y: -145.6589813232422 },
                { x: -89.17230224609376, y: -146.03591918945312 },
                { x: -86.18425750732423, y: -146.30137634277344 },
                { x: -83.18839263916017, y: -146.45562744140625 },
                { x: -80.50000000000001, y: -146.5 },
                { x: -80.18887329101564, y: -146.4993438720703 },
                { x: -77.18978881835939, y: -146.4327850341797 },
                { x: -74.19520568847658, y: -146.2554168701172 },
                { x: -71.20931243896486, y: -145.96681213378906 },
                { x: -68.2362747192383, y: -145.56683349609375 },
                { x: -65.2803421020508, y: -145.05551147460938 },
                { x: -62.345760345459, y: -144.4333038330078 },
                { x: -59.43675231933595, y: -143.7008056640625 },
                { x: -56.55746459960939, y: -142.8590087890625 },
                { x: -53.71202468872072, y: -141.90907287597656 },
                { x: -50.90452575683595, y: -140.85227966308594 },
                { x: -48.138923645019545, y: -139.6902313232422 },
                { x: -45.419075012207045, y: -138.42477416992188 },
                { x: -42.74882888793947, y: -137.05780029296875 },
                { x: -40.13185119628908, y: -135.59136962890625 },
                { x: -37.571716308593764, y: -134.02781677246094 },
                { x: -35.07208633422853, y: -132.36927795410156 },
                { x: -32.63617324829103, y: -130.61849975585938 },
                { x: -30.26748085021974, y: -128.77777099609375 },
                { x: -27.96908569335939, y: -126.85002136230469 },
                { x: -25.744276046752944, y: -124.8377456665039 },
                { x: -23.595973968505874, y: -122.7440414428711 },
                { x: -21.527309417724624, y: -120.57156372070312 },
                { x: -19.540988922119155, y: -118.32356262207031 },
                { x: -17.640048980712905, y: -116.00289916992188 },
                { x: -15.827009201049819, y: -113.61296844482422 },
                { x: -14.104688644409194, y: -111.15684509277344 },
                { x: -12.475453376770032, y: -108.63803100585938 },
                { x: -10.941856384277356, y: -106.05986022949219 },
                { x: -9.506141662597669, y: -103.4259033203125 },
                { x: -8.170475959777844, y: -100.73985290527344 },
                { x: -6.937061309814466, y: -98.00534057617188 },
                { x: -5.807595729827892, y: -95.22627258300781 },
                { x: -4.783812999725353, y: -92.40655517578125 },
                { x: -3.86738419532777, y: -89.5501480102539 },
                { x: -3.059512615203868, y: -86.66114807128906 },
                { x: -2.361268758773814, y: -83.74372100830078 },
                { x: -1.773503065109263, y: -80.80204772949219 },
                { x: -1.2967981100082493, y: -77.8403549194336 },
                { x: -0.931446433067331, y: -74.86287689208984 },
                { x: -0.6774513125419704, y: -71.87381744384766 },
                { x: -0.5346736311912621, y: -68.87737274169922 },
                { x: -0.5000000000000081, y: -66.5 },
                { x: -0.5023717284202657, y: -65.87771606445312 },
                { x: -0.5801120400428849, y: -62.8788948059082 },
                { x: -0.7683201432228162, y: -59.88498306274414 },
                { x: -1.0675164461135933, y: -56.900123596191406 },
                { x: -1.477984547615058, y: -53.928504943847656 },
                { x: -1.9995892047882142, y: -50.974388122558594 },
                { x: -2.631993532180792, y: -48.04197692871094 },
                { x: -3.37455558776856, y: -45.13551712036133 },
                { x: -4.226419448852544, y: -42.25918960571289 },
                { x: -5.186389923095708, y: -39.417118072509766 },
                { x: -6.253102302551274, y: -36.61334228515625 },
                { x: -7.42494916915894, y: -33.85188674926758 },
                { x: -8.700166702270511, y: -31.136577606201172 },
                { x: -10.076744079589847, y: -28.471269607543945 },
                { x: -11.552577018737797, y: -25.85958480834961 },
                { x: -13.125368118286136, y: -23.305126190185547 },
                { x: -14.792714118957521, y: -20.811361312866207 },
                { x: -16.552137374877933, y: -18.38166999816894 },
                { x: -18.40094375610352, y: -16.01930236816406 },
                { x: -20.336429595947266, y: -13.727390289306639 },
                { x: -22.355772018432617, y: -11.509016990661618 },
                { x: -24.45613670349121, y: -9.367156028747555 },
                { x: -26.63444709777832, y: -7.304682731628414 },
                { x: -28.887697219848633, y: -5.324339389801022 },
                { x: -31.212783813476562, y: -3.4288175106048544 },
                { x: -33.60651779174805, y: -1.6207203865051227 },
                { x: -34.9, y: -0.6999999999999957 },
                { x: -35.67070007324219, y: -1.8833574056625322 },
                { x: -37.44599151611328, y: -4.300645828247066 },
                { x: -39.428470611572266, y: -6.5507388114929155 },
                { x: -41.633060455322266, y: -8.583113670349116 },
                { x: -44.05724334716797, y: -10.34734439849853 },
                { x: -46.676063537597656, y: -11.807113647460932 },
                { x: -49.4466552734375, y: -12.953698158264155 },
                { x: -52.321144104003906, y: -13.808321952819817 },
                { x: -52.7, y: -13.899999999999993 },
                { x: -55.259159088134766, y: -14.411566734313958 },
                { x: -58.23048400878906, y: -14.822513580322259 },
                { x: -61.218387603759766, y: -15.089338302612298 },
                { x: -64.21387481689453, y: -15.251671791076653 },
                { x: -67.21248626708984, y: -15.341515541076651 },
                { x: -70.21214294433594, y: -15.383772850036612 },
                { x: -73.21210479736328, y: -15.397986412048331 },
                { x: -76.2, y: -15.399999999999991 },
                { x: -76.21211242675781, y: -15.399972915649405 },
                { x: -79.2109146118164, y: -15.320666313171378 },
                { x: -80.5, y: -15.29999999999999 },
                { x: -82.21063232421875, y: -15.31680393218993 },
                { x: -85.20992279052734, y: -15.381377220153798 },
                { x: -86.9, y: -15.39999999999999 },
                { x: -88.2096939086914, y: -15.414648056030263 },
                { x: -91.20960235595703, y: -15.436800003051747 },
                { x: -94.20957946777344, y: -15.429188728332509 },
                { x: -97.20894622802734, y: -15.370062828063952 },
                { x: -100.20563507080078, y: -15.232209205627429 },
                { x: -103.19488525390625, y: -14.981355667114245 },
                { x: -106.16675567626953, y: -14.574811935424792 },
                { x: -108.1, y: -14.199999999999987 },
                { x: -109.10240936279297, y: -13.960983276367173 },
                { x: -111.96687316894531, y: -13.07402133941649 },
                { x: -114.7138442993164, y: -11.87261581420897 },
                { x: -117.29251098632812, y: -10.343335151672349 },
                { x: -119.66349029541016, y: -8.50822257995604 },
                { x: -121.8106918334961, y: -6.415182113647446 },
                { x: -123.7413330078125, y: -4.120318412780747 },
                { x: -125.47720336914062, y: -1.6743693351745452 },
                { x: -126.1, y: -0.6999999999999845 },
                { x: -127.60017395019531, y: -1.7714798450469815 },
                { x: -129.9881134033203, y: -3.5871381759643395 },
                { x: -132.30718994140625, y: -5.490007400512679 },
                { x: -134.55418395996094, y: -7.477449893951399 },
                { x: -136.72598266601562, y: -9.546786308288558 },
                { x: -138.81956481933594, y: -11.695265769958478 },
                { x: -140.8319091796875, y: -13.919963836669904 },
                { x: -142.7600860595703, y: -16.21802330017088 },
                { x: -144.60134887695312, y: -18.586311340332013 },
                { x: -146.3529815673828, y: -21.021608352661115 },
                { x: -148.01235961914062, y: -23.520677566528303 },
                { x: -149.57699584960938, y: -26.08016586303709 },
                { x: -151.04444885253906, y: -28.69653892517088 },
                { x: -152.41249084472656, y: -31.366268157958967 },
                { x: -153.67893981933594, y: -34.08562850952146 },
                { x: -154.84188842773438, y: -36.85084915161131 },
                { x: -155.8995361328125, y: -39.65802001953123 },
                { x: -156.85032653808594, y: -42.50316619873045 },
                { x: -157.69290161132812, y: -45.38220977783201 },
                { x: -158.42616271972656, y: -48.29103469848631 },
                { x: -159.0492401123047, y: -51.22545242309568 },
                { x: -159.56126403808594, y: -54.181243896484354 },
                { x: -159.9622039794922, y: -57.15413665771482 },
                { x: -160.2520294189453, y: -60.1399345397949 },
                { x: -160.43067932128906, y: -63.134429931640604 },
                { x: -160.4990997314453, y: -66.13346862792967 }
            ];
            
            // create empty composite body 
            let robot = Composite.create({ label: 'TriBot' });

            // Create main body from SVG vertices
            let body = Bodies.fromVertices(xPos, yPos, vertices, {
                collisionFilter: { group: group },
                frictionAir: 0.1,
                render: { fillStyle: bodyColour, strokeStyle: '#2E2B44', lineWidth: 1}
            });

            // Scale body to approx 50 pixel width/length
            Body.scale(body,0.28,0.28);
            
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
                    x: motorOffset[0].x - ((motorHeight/2) * Math.sin(Math.PI/6)), 
                    y: motorOffset[0].y + ((motorHeight/2) * Math.cos(Math.PI/6))
                },
                stiffness: 0.7,
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
                    x: motorOffset[0].x + ((motorHeight/2) * Math.sin(Math.PI/6)), 
                    y: motorOffset[0].y - ((motorHeight/2) * Math.cos(Math.PI/6))
                },
                stiffness: 0.7,
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
                    x: motorOffset[1].x + ((motorHeight/2) * Math.sin(5*Math.PI/6)), 
                    y: motorOffset[1].y - ((motorHeight/2) * Math.cos(5*Math.PI/6))
                },
                stiffness: 0.7,
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
                    x: motorOffset[1].x - ((motorHeight/2) * Math.sin(5*Math.PI/6)), 
                    y: motorOffset[1].y + ((motorHeight/2) * Math.cos(5*Math.PI/6))
                },
                stiffness: 0.7,
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
                stiffness: 0.7,
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
                stiffness: 0.7,
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
                Composite.rotate(this.body, Math.PI,{x: xPos, y: yPos});
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

        // Stop movement of the robot, returning its original motorspeeds
        stopMovement(){
            let previous = this.getMotorSpeeds().slice();
            this.setMotorSpeedAll(0,0,0);
            return previous;
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

    window.TriBot = TriBot;
})(Matter, Robot);