// TODO: clean up all this code into a module
function setMotorSpeed(motor, speed) {
    if (motor === 'motorA') {
        Two.setMotorSpeed(0, speed / 100);
    } else if (motor === 'motorB') {
        Two.setMotorSpeed(1, speed / 100);
    }
}
function setMotorSpeed2(motor, speed) {
    if (motor === 'motorA') {
        One.setMotorSpeed(0, speed / 100);
    } else if (motor === 'motorB') {
        One.setMotorSpeed(1, speed / 100);
    }
}

var initFunc = function(interpreter, globalObject) {
    // Create 'robot' global object.
    var robot = interpreter.nativeToPseudo({});
      interpreter.setProperty(globalObject, 'setMotorSpeed', interpreter.createNativeFunction(setMotorSpeed));
};

var initFunc2 = function(interpreter, globalObject) {
    // Create 'robot' global object.
    var robot = interpreter.nativeToPseudo({});
      interpreter.setProperty(globalObject, 'setMotorSpeed', interpreter.createNativeFunction(setMotorSpeed2));
};

function runSoccerSim() {
    let submittedCode = document.getElementById('importExport').value;
    var myInterpreter = new Interpreter(submittedCode, initFunc);
    function nextStep() {
        var i = 0;
        while (++i < 2000) {
            myInterpreter.step();
        }
        if (myInterpreter.step()) {
            window.setTimeout(nextStep, 0);
        }
    }
    nextStep();
    let submittedCode2 = document.getElementById('importExport2').value;
    var myInterpreter2 = new Interpreter(submittedCode2, initFunc2);

    function nextStep2() {
        var i = 0;
        while (++i < 2000) {
            myInterpreter2.step();
        }
        if (myInterpreter2.step()) {
            window.setTimeout(nextStep2, 0);
        }
    }
    nextStep2();
}