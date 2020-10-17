/**
 * @description Simulation and editor controls for the SoccerSim interface.
 */
;(function() {
    let blocklyControls = {},
        simControls = {};
    blocklyControls.selected = 'robot1';
    blocklyControls.robots = ['robot1', 'robot2'];

    let jsControls = {};
    jsControls.selected = 'robot1';
    jsControls.robots = ['robot1', 'robot2'];

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
        localStorage.setItem('soccersim-' + robot, js);
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
            xml = '<xml xmlns="https://developers.google.com/blockly/xml"/>';
        }
        currentWorkspace.clear();
        let dom = Blockly.Xml.textToDom(xml);
        Blockly.Xml.domToWorkspace(dom, currentWorkspace);
    };

    jsControls.loadProgram = function (robot, currentEditor) {
        currentEditor = currentEditor;
        robot = robot || jsControls.selected;
        console.log(robot);
        let js = localStorage.getItem('soccersim-' + robot);
        if (!js) {
            js = '';
        }
        codeMirrorEditor.setValue(js);
    }

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

    document.getElementById("uploaded-file").addEventListener("change", blocklyControls.uploadFile, false);

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

    document.getElementById("uploaded-file").addEventListener("change", jsControls.uploadFile, false);


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

        // Load saved program
        jsControls.loadProgram();
    };

    /**
     * Use the hidden workspace to load all programs and get code.
     */
    simControls.getCode = function() {
        let robots = [window.One, window.Two];
        let codes = [];
        
        // Show loading
        document.getElementById('notifications').innerHTML = '';
        let runButton = document.getElementById('run-robots');
        let stopButton = document.getElementById('stop-robots');
        runButton.classList.add('is-loading');
        runButton.setAttribute('disabled', '');
        stopButton.removeAttribute('disabled');

        // Save program so we can load it easily
        blocklyControls.saveProgram();
        
        for (let robot of blocklyControls.robots) {
            blocklyControls.loadProgram(robot, hiddenWorkspace);
            // Convert to code
            try {
                codes.push(Blockly.JavaScript.workspaceToCode(hiddenWorkspace));
            } catch (error) {
                simControls.showError(error.toString());
                stopButton.setAttribute('disabled', '');
                runButton.removeAttribute('disabled');
                console.log(error);
            }
        }
        runButton.classList.remove('is-loading');
        intptr.startSim(robots, codes);
    };

    simControls.getCodeJS = function() {
        let robots = [window.One, window.Two];
        let codes = [];
        
        // Show loading
        document.getElementById('notifications').innerHTML = '';
        let runButton = document.getElementById('run-robots');
        let stopButton = document.getElementById('stop-robots');
        runButton.classList.add('is-loading');
        runButton.setAttribute('disabled', '');
        stopButton.removeAttribute('disabled');

        // Save program so we can load it easily
        //jsControls.saveProgram();
        
        for (let robot of jsControls.robots) {
            //jsControls.loadProgram(robot, hiddenWorkspace);
            // Convert to code
            codes.push(codeMirrorEditor.getValue());
        }
        runButton.classList.remove('is-loading');
        intptr.startSim(robots, codes);
    };

    simControls.stopSim = function() {
        let runButton = document.getElementById('run-robots');
        let stopButton = document.getElementById('stop-robots');
        stopButton.setAttribute('disabled', '');
        runButton.removeAttribute('disabled');
    };

    simControls.showError = function(message) {
        const errorBox = document.createElement('div');
        errorBox.classList.add('notification', 'is-danger', 'is-light');
        errorBox.innerHTML = 'There was an problem when running your program. Please <a' + 
        ' href="https://github.com/kcnotes/soccersim/issues" target="_blank">submit an issue on GitHub</a>.<br/>' + 
        message;
        
        const closeIcon = document.createElement('button');
        closeIcon.classList.add('delete');
        closeIcon.addEventListener('click', function() {
            errorBox.remove();
        });
        errorBox.appendChild(closeIcon);
        
        document.getElementById('notifications').appendChild(errorBox);
    };

    window.blocklyControls = blocklyControls;
    window.jsControls = jsControls;
    window.simControls = simControls;
})();
