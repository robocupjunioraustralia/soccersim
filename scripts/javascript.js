
;(function() {
  ace.require("ace/ext/language_tools");
  const editor = ace.edit("editor");
  editor.getSession().setMode("ace/mode/javascript");
  //editor.setTheme("ace/theme/dawn");
  editor.setOptions({
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    //enableSnippets: true,
    showPrintMargin: false
  });

  var wordCompleter = {
    getCompletions: function(editor, session, pos, prefix, callback) {
        callback(null, [
          {name: "var", value: "var", score: 1, meta: "keyword"},
          {value: "if", score: 1, meta: "keyword"},
          {value: "while", score: 1, meta: "keyword"},
          {value: "for", score: 1, meta: "keyword"},
          {value: "setInitialPosition", snippet: "setInitialPosition('centre')", score: 1, meta: "Sets the initial position. Run this at or near the start of your program."},
          {value: "setMotorSpeed", snippet: "setMotorSpeed('motorA', 100)", score: 1, meta: "Sets the motor speed, for a particular motor."},
          {value: "stopMotor", snippet: "stopMotor('motorA')", score: 1, meta: "Stops a particular motor."},
          {value: "getMotorSpeed", snippet: "getMotorSpeed('motorA')", score: 1, meta: "Returns the current speed of the motor."},
          {value: "getBallAngle", snippet: "getBallAngle()", score: 1, meta: "Returns the current ball angle -180 <= angle < 180, relative to robot."},
          {value: "getBallDistance", snippet: "getBallDistance()", score: 1, meta: "Returns the current ball distance relative to the robot, in pixels."},
          {value: "getCompassHeading", snippet: "getCompassHeading()", score: 1, meta: "Returns the current robot compass heading -180 <= angle < 180, relative to the robot."},
        ]);
    }
  }
  editor.completers = [wordCompleter]
})();
