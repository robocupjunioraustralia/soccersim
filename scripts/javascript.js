
;(function() {
    var editor = CodeMirror.fromTextArea(myTextArea, {
        lineNumbers: true,
        matchBrackets: true,
        continueComments: "Enter",
        mode: "javascript",
        extraKeys: {"Ctrl-Q": "toggleComment"}
      });
      window.codeMirrorEditor = editor;
})();
