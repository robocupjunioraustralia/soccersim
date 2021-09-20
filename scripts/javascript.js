
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
        var wordList = ["while", "for", "if", "setInitialPosition", "setMotorSpeed", "stopMotor", "getMotorSpeed", "getBallAngle", "getBallDistance", "getCompassHeading"];
        callback(null, wordList.map(function(word) {
            return {
                caption: word,
                value: word,
                meta: ""
            };
        }));

    }
  }
  editor.completers = [wordCompleter]
})();
