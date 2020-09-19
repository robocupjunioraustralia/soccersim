/**
 * @description Simulation and editor controls for the SoccerSim interface.
 */
;(function() {
    var blocklyControls = {};
    blocklyControls.selected = 'robot1';

    blocklyControls.saveProgram = function(robot) {
        // Defaults to currently selected robot
        robot = robot || blocklyControls.selected;
        let xml = Blockly.Xml.workspaceToDom(workspace);
        localStorage.setItem('soccersim-' + robot,
            Blockly.Xml.domToPrettyText(xml));
        console.log('saved ' + robot);
    };

    blocklyControls.loadProgram = function (robot) {
        robot = robot || blocklyControls.selected;
        // Defaults to currently selected robot
        let xml = localStorage.getItem('soccersim-' + robot);
        console.log(xml);
        workspace.clear();
        let dom = Blockly.Xml.textToDom(xml);
        Blockly.Xml.domToWorkspace(dom, workspace);
        console.log('loaded ' + robot);
    };

    blocklyControls.clearWorkspace = function() {
        if (!confirm('Are you sure you want to clear the workspace?')) {
            return;
        }
        workspace.clear();
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
    }

    blocklyControls.downloadAsFile = function(robot) {
        // Defaults to currently selected robot
        robot = robot || blocklyControls.selected;
        let xml = Blockly.Xml.workspaceToDom(workspace);
        download(Blockly.Xml.domToPrettyText(xml), robot, 'application/xml');
    };

    blocklyControls.uploadFile = function () {
        if (!confirm('Are you sure you want to clear the workspace and upload your file?')) {
            return;
        }
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
            }
        }
        console.log();
    };

    document.getElementById("uploaded-file").addEventListener("change", blocklyControls.uploadFile, false);

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
    window.blocklyControls = blocklyControls;
})();
