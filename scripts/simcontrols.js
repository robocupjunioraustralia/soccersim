/**
 * @description Simulation and editor controls for the SoccerSim interface.
 */
;(function() {
    let blocklyControls = {},
        simControls = {};
    blocklyControls.selected = 'robot1';
    blocklyControls.robots = ['robot1', 'robot2'];
    blocklyControls.starterCode =
`<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="controls_whileForever" id="_8qus:u7fI*YO_BwfRna" x="450" y="278">
    <statement name="DO">
      <block type="motor_set_speed" id="@G+4LgyJyXNV^1ztX*IV">
        <field name="motor">'motorA'</field>
        <value name="speed_input">
          <shadow type="math_number_minmax" id=",SCKuv.TC[s7uYsbf)Wo">
            <mutation min="-100" max="100" label="Number" precision="0"/>
            <field name="SLIDER">100</field>
          </shadow>
        </value>
        <next>
          <block type="motor_set_speed" id="!CF^l^zv2qfn0sR#h6v8">
            <field name="motor">'motorB'</field>
            <value name="speed_input">
              <shadow type="math_number_minmax" id="a?[KBdzk]q5[B/))#8;I">
                <mutation min="-100" max="100" label="Number" precision="0"/>
                <field name="SLIDER">100</field>
              </shadow>
            </value>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`;

    let jsControls = {};
    jsControls.selected = 'robot1';
    jsControls.robots = ['robot1', 'robot2'];
    jsControls.starterCode =
`while(1) {
  setMotorSpeed('motorA', 100);
  setMotorSpeed('motorB', 100);
}`;
    
    // Define controls for modifying robots directly
    let robotControls = {};
    robotControls.robots = null;
    robotControls.ball = null;

    /**
     * Saves the current workspace into localStorage
     * @param {String} robot Robot ID
     */
    blocklyControls.saveProgram = function(robot) {
        // Defaults to currently selected robot
        robot = robot || blocklyControls.selected;
        let xml = Blockly.Xml.workspaceToDom(workspace);
        localStorage.setItem('soccersim-' + robot,
            Blockly.Xml.domToPrettyText(xml));
    };

    /**
     * Saves the current workspace into localStorage
     * @param {String} robot Robot ID
     */
    jsControls.saveProgram = function(robot) {
        // Defaults to currently selected robot
        robot = robot || jsControls.selected;
        let js = codeMirrorEditor.getValue();
        localStorage.setItem('soccersim-js-' + robot, js);
    };

    /**
     * Loads the selected robot from localStorage into the workspace
     * @param {String} robot robot ID
     */
    blocklyControls.loadProgram = function (robot, currentWorkspace) {
        currentWorkspace = currentWorkspace || workspace;
        robot = robot || blocklyControls.selected;
        // Defaults to currently selected robot
        let xml = localStorage.getItem('soccersim-' + robot);
        if (!xml) {
            xml = blocklyControls.starterCode;
        }
        currentWorkspace.clear();
        let dom = Blockly.Xml.textToDom(xml);
        Blockly.Xml.domToWorkspace(dom, currentWorkspace);
    };

    jsControls.loadProgram = function (robot, currentEditor) {
        currentEditor = currentEditor;
        robot = robot || jsControls.selected;
        let js = localStorage.getItem('soccersim-js-' + robot);
        if (!js) {
            js = jsControls.starterCode;
        }
        codeMirrorEditor.setValue(js);
    };

    /**
     * 
     */
    blocklyControls.clearWorkspace = function() {
        if (!confirm('Are you sure you want to clear the workspace?')) {
            return;
        }
        workspace.clear();
    };

    /**
     * 
     */
    jsControls.clearWorkspace = function() {
        if (!confirm('Are you sure you want to clear the workspace?')) {
            return;
        }
        codeMirrorEditor.setValue('');
    };

    /**
     * Download a file
     * @param {String} data 
     * @param {String} filename 
     * @param {String} type 
     */
    function download(data, filename, type) {
        var file = new Blob([data], {
            type: type
        });
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        else { // Others
            var a = document.createElement("a"),
                url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function () {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    };

    blocklyControls.downloadAsFile = function(robot) {
        // Defaults to currently selected robot
        robot = robot || blocklyControls.selected;
        let xml = Blockly.Xml.workspaceToDom(workspace);
        download(Blockly.Xml.domToPrettyText(xml), robot, 'application/xml');
    };

    jsControls.downloadAsFile = function(robot) {
        robot = robot || jsControls.selected;
        let js = codeMirrorEditor.getValue();
        download(js, robot, 'text/javascript');
    }

    blocklyControls.uploadFile = function () {
        if (this.files.length !== 1) {
            return;
        }
        let file = this.files[0];
        if (file) {
            let reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function (evt) {
                let xml = evt.target.result;
                let dom = Blockly.Xml.textToDom(xml);
                Blockly.Xml.domToWorkspace(dom, workspace);
                document.getElementById("uploaded-file").value = "";
            };
        }
    };

    
    jsControls.uploadFile = function () {
        if (this.files.length !== 1) {
            return;
        }
        let file = this.files[0];
        if (file) {
            let reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function (evt) {
                let js = evt.target.result;
                codeMirrorEditor.setValue(js);
                document.getElementById("uploaded-file").value = "";
            };
        }
    };

    /**
     * Handle switching editor between robot 1 and 2
     * @param {String} robot 'robot1' or 'robot2'
     */
    blocklyControls.switchProgram = function(robot) {
        if (robot === blocklyControls.selected) return;
        
        // Automatically save
        blocklyControls.saveProgram();

        // Switch to the other robot
        let robot1TabSelector = document.getElementById('switch-robot-1');
        let robot2TabSelector = document.getElementById('switch-robot-2');
        let typeButton = document.getElementById('robot-type-button');
        blocklyControls.selected = robot;
        
        let selectorClasses = ['is-info', 'is-selected'];
        if (robot === 'robot1') {
            robot1TabSelector.classList.add(...selectorClasses);
            robot2TabSelector.classList.remove(...selectorClasses);
        }
        else if (robot === 'robot2') {
            robot1TabSelector.classList.remove(...selectorClasses);
            robot2TabSelector.classList.add(...selectorClasses);
        }
        typeButton.value = robotControls.robots[robot].type;

        // Load saved program
        blocklyControls.loadProgram();
    };

    /**
     * Handle switching editor between robot 1 and 2
     * @param {String} robot 'robot1' or 'robot2'
     */
    jsControls.switchProgram = function(robot) {
        if (robot === jsControls.selected) return;
        
        // Automatically save
        jsControls.saveProgram();

        // Switch to the other robot
        let robot1TabSelector = document.getElementById('switch-robot-1');
        let robot2TabSelector = document.getElementById('switch-robot-2');
        let typeButton = document.getElementById('robot-type-button');
        jsControls.selected = robot;
        
        let selectorClasses = ['is-info', 'is-selected'];
        if (robot === 'robot1') {
            robot1TabSelector.classList.add(...selectorClasses);
            robot2TabSelector.classList.remove(...selectorClasses);
        }
        else if (robot === 'robot2') {
            robot1TabSelector.classList.remove(...selectorClasses);
            robot2TabSelector.classList.add(...selectorClasses);
        }
        typeButton.value = robotControls.robots[robot].type;

        // Load saved program
        jsControls.loadProgram();
    };

    /**
     * Use the hidden workspace to load all programs and get code.
     */
    simControls.getCode = function() {
        let robots = Object.values(robotControls.robots);
        let codes = [];
        
        // Show loading
        errorHandler.clear();
        let runButton = document.getElementById('run-robots');
        let stopButton = document.getElementById('stop-robots');
        let typeButton = document.getElementById('robot-type-button');

        if (runButton.getAttribute('disabled') === '') {
            return;
        };

        runButton.classList.add('is-loading');
        runButton.setAttribute('disabled', '');
        typeButton.setAttribute('disabled', '');
        stopButton.removeAttribute('disabled');

        // Save program so we can load it easily
        blocklyControls.saveProgram();
        
        for (let robot of blocklyControls.robots) {
            blocklyControls.loadProgram(robot, hiddenWorkspace);
            // Convert to code
            try {
                codes.push(Blockly.JavaScript.workspaceToCode(hiddenWorkspace));
            } catch (error) {
                errorHandler.addError(`Error: ${error.toString()}`, 'danger');
                stopButton.setAttribute('disabled', '');
                runButton.removeAttribute('disabled');
                console.log(error);
            }
        }
        runButton.classList.remove('is-loading');
        intptr.startSim(robots, codes, robotControls.ball);
    };

    simControls.getCodeJS = function() {
        let robots = Object.values(robotControls.robots);
        let codes = [];
        
        // Show loading
        errorHandler.clear();
        let runButton = document.getElementById('run-robots');
        let stopButton = document.getElementById('stop-robots');

        if (runButton.getAttribute('disabled') === '') {
            return;
        }

        runButton.classList.add('is-loading');
        runButton.setAttribute('disabled', '');
        stopButton.removeAttribute('disabled');

        // Save program so we can load it easily
        jsControls.saveProgram();
        
        for (let robot of jsControls.robots) {
            let js = localStorage.getItem('soccersim-js-' + robot);
            if (!js) {
                js = jsControls.starterCode;
            }
            codes.push(js);
        }
        runButton.classList.remove('is-loading');
        intptr.startSim(robots, codes, robotControls.ball);
    };

    simControls.stopSim = function() {
        let runButton = document.getElementById('run-robots');
        let stopButton = document.getElementById('stop-robots');
        let typeButton = document.getElementById('robot-type-button');

        if (stopButton.getAttribute('disabled') === '') {
            return;
        }

        stopButton.setAttribute('disabled', '');
        runButton.removeAttribute('disabled');
        typeButton.removeAttribute('disabled');
    };

    simControls.init = function() {
        // Add event listener to the appropriate interface only
        if (window.config && window.config.INTERFACE_TYPE === 'javascript') {
            document.getElementById("uploaded-file").addEventListener("change", jsControls.uploadFile, false);
            jsControls.loadProgram();
        }
        else if (window.config && window.config.INTERFACE_TYPE === 'blocks') {
            document.getElementById("uploaded-file").addEventListener("change", blocklyControls.uploadFile, false);
            blocklyControls.loadProgram();
        }
    };

    // Add references to robot objects to simcontrols
    robotControls.setRobots = function(bots){
        robotControls.robots = {
            'robot1': bots[0],
            'robot2': bots[1]
        };
    };

    // Add a reference to ball object to simcontrols
    robotControls.setBall = function(ball){
        robotControls.ball = ball;
    };

    robotControls.addProxyBot = function(robotName, type, pos){
        // never should have switched between array and dictionary
        const index = robotName.slice(5);
        let add = null;
        if (type === 'DualBot'){
            add = new DualBot('blue', pos.x, pos.y, sim.fieldWidth, sim.fieldHeight);
        } else if (type === 'TriBot'){
            add = new TriBot('blue', pos.x, pos.y, sim.fieldWidth, sim.fieldHeight);
        }
        const blue = new Proxy(add, {
            set: function(target, key, value) {
                switch (key) {
                    case 'motorSpeeds':
                        document.getElementById(`blue${index}_motorSpeeds`).textContent = formatMotorSpeeds(value);
                        break;
                    case 'prevAngle':
                        document.getElementById(`blue${index}_prevAngle`).textContent = whiteSpacePadding(calcBearing(value, true).toFixed(1));
                        break;
                    case 'pos':
                        const blueBallPos = add.getBallPosition(ball)
                        document.getElementById(`blue${index}_ballDistance`).textContent = whiteSpacePadding(blueBallPos.distance.toFixed(1));
                        document.getElementById(`blue${index}_ballAngle`).textContent = whiteSpacePadding(calcBearing(blueBallPos.angle, false).toFixed(1));
                        break;
                    default:
                        break;
                }
                return Reflect.set(...arguments);
            }
        });
        sim.robots.push(blue);
        sim.addBody(blue.body);
        // Motor speeds is the only entry currently that changes in format
        document.getElementById(`blue${index}_motorSpeeds`).textContent = formatMotorSpeeds(add.motorSpeeds);
        return blue;
    }

    // Change the type of the robot, ie. dualbot -> tribot
    robotControls.switchType = function(type){
        let selectedRobot = null;
        if (window.config && window.config.INTERFACE_TYPE === 'blocks') {
            selectedRobot = blocklyControls.selected;
        }
        else if (window.config && window.config.INTERFACE_TYPE === 'javascript') {
            selectedRobot = jsControls.selected;
        }
        if (!selectedRobot) {
            console.error('No selected robot or available interface');
            return;
        }

        let robotObj = robotControls.robots[selectedRobot];
        if (robotObj.type != type){
            // Removes old bot and get its pos
            let old = sim.removeBot(robotObj);
            // Add new bot and get obj, add to robotControls
            let add = this.addProxyBot(selectedRobot, type, old);
            robotControls.robots[selectedRobot] = add;
        }
    };

    window.robotControls = robotControls;
    window.blocklyControls = blocklyControls;
    window.jsControls = jsControls;
    window.simControls = simControls;

    window.addEventListener("load", function() {
        simControls.init();
    });
})();
