'use strict';
var workspace = null;

function start() {

  // Parse the URL arguments.
  var toolbox = getToolboxElement();
  var toolboxNames = [
      'toolbox-rcja'
  ];
  var match = location.search.match(/side=([^&]+)/);
  var side = match ? match[1] : 'start';
  // Create main workspace.
  workspace = Blockly.inject('blocklyDiv',
      {
        comments: true,
        collapse: true,
        disable: true,
        grid:
          {
            spacing: 20,
            length: 3,
            colour: '#ccc',
            snap: true
          },
        horizontalLayout: false,
        maxBlocks: Infinity,
        maxInstances: {'test_basic_limit_instances': 3},
        media: 'pxt-blockly/media/',
        oneBasedIndex: true,
        readOnly: false,
        rtl: 0,
        move: {
          scrollbars: true,
          drag: true,
          wheel: false,
        },
        toolbox: toolbox,
        toolboxPosition: 'start',
        toolboxOptions:
          {
            color: true,
            inverted: true
          },
        zoom:
          {
            controls: true,
            wheel: true,
            startScale: 1.0,
            maxScale: 4,
            minScale: 0.25,
            scaleSpeed: 1.1
          },
        renderer: 'pxt'
      });
  addToolboxButtonCallbacks();
  // Restore previously displayed text.
  if (sessionStorage) {
    var text = sessionStorage.getItem('textarea');
    if (text) {
      document.getElementById('importExport').value = text;
    }
  } else {
  }
  taChange();
}

function addToolboxButtonCallbacks() {
  var addAllBlocksToWorkspace = function(button) {
    var workspace = button.getTargetWorkspace();
    var blocks = button.workspace_.getTopBlocks();
    for(var i = 0, block; block = blocks[i]; i++) {
      var xml = Blockly.utils.xml.createElement('xml');
      xml.appendChild(Blockly.Xml.blockToDom(block));
      Blockly.Xml.appendDomToWorkspace(xml, workspace);
    }
  };
  var randomizeLabelText = function(button) {
    var blocks = button.targetWorkspace_
        .getBlocksByType('test_fields_label_serializable');
    var possible = 'AB';
    for (var i = 0, block; block = blocks[i]; i++) {
      var text = '';
      for (var j = 0; j < 4; j++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      block.setFieldValue(text, 'LABEL');
    }
  };
  var setRandomStyle = function(button) {
    var blocks = button.workspace_.getAllBlocks();
    var styles = Object.keys(Blockly.getTheme().getAllBlockStyles());
    styles.splice(styles.indexOf(blocks[0].getStyleName()), 1);
    var style = styles[Math.floor(Math.random() * styles.length)];
    for(var i = 0, block; block = blocks[i]; i++) {
      block.setStyle(style);
    }
  };
  var toggleEnabled = function(button) {
    var blocks = button.workspace_.getAllBlocks();
    for(var i = 0, block; block = blocks[i]; i++) {
      block.setEnabled(!block.isEnabled());
    }
  };
  var toggleShadow = function(button) {
    var blocks = button.workspace_.getAllBlocks();
    for(var i = 0, block; block = blocks[i]; i++) {
      block.setShadow(!block.isShadow());
    }
  };
  var toggleCollapsed = function(button) {
    var blocks = button.workspace_.getAllBlocks();
    for(var i = 0, block; block = blocks[i]; i++) {
      block.setCollapsed(!block.isCollapsed());
    }
  };
  var setInput = function(button) {
    Blockly.prompt('Input text to set.', 'ab', function(input) {
      var blocks = button.getTargetWorkspace().getAllBlocks();
      for(var i = 0, block; block = blocks[i]; i++) {
        if (block.getField('INPUT')) {
          block.setFieldValue(input, 'INPUT');
        }
      }
    })
  };
  var changeImage = function(button) {
    var blocks = button.workspace_.getBlocksByType('test_fields_image');
    var possible = 'abcdefghijklm';
    var image = possible.charAt(Math.floor(Math.random() * possible.length));
    var src = 'https://blockly-demo.appspot.com/static/tests/media/'
      + image + '.png';
    for (var i = 0, block; block = blocks[i]; i++) {
      var imageField = block.getField('IMAGE');
      imageField.setValue(src);
      imageField.setText(image);
    }
  };
  workspace.registerButtonCallback(
      'changeImage', changeImage);
  workspace.registerButtonCallback(
      'addAllBlocksToWorkspace', addAllBlocksToWorkspace);
  workspace.registerButtonCallback(
      'setInput', setInput);
  workspace.registerButtonCallback(
      'setRandomStyle', setRandomStyle);
  workspace.registerButtonCallback(
      'toggleEnabled', toggleEnabled);
  workspace.registerButtonCallback(
      'toggleShadow', toggleShadow);
  workspace.registerButtonCallback(
    'toggleCollapsed', toggleCollapsed);
  workspace.registerButtonCallback(
      'randomizeLabelText', randomizeLabelText);
}

function getToolboxElement() {
  var match = location.search.match(/toolbox=([^&]+)/);
  // Default to the basic toolbox with categories and untyped variables,
  // but override that if the toolbox type is set in the URL.
  var toolboxSuffix = (match ? match[1] : 'rcja');
  return document.getElementById('toolbox-' + toolboxSuffix);
}

function toXml() {
  var output = document.getElementById('importExport');
  var xml = Blockly.Xml.workspaceToDom(workspace);
  output.value = Blockly.Xml.domToPrettyText(xml);
  output.focus();
  output.select();
  taChange();
}

function fromXml() {
  var input = document.getElementById('importExport');
  var xml = Blockly.Xml.textToDom(input.value);
  Blockly.Xml.domToWorkspace(xml, workspace);
  taChange();
}

function toCode(lang) {
  var output = document.getElementById('importExport');
  output.value = Blockly[lang].workspaceToCode(workspace);
  taChange();
}

// Disable the "Import from XML" button if the XML is invalid.
// Preserve text between page reloads.
function taChange() {
  var textarea = document.getElementById('importExport');
  if (sessionStorage) {
    sessionStorage.setItem('textarea', textarea.value);
  }
  var valid = true;
  try {
    Blockly.Xml.textToDom(textarea.value);
  } catch (e) {
    valid = false;
  }
  document.getElementById('import').disabled = !valid;
}

function logger(e) {
  console.log(e);
}

function centerOnBlock() {
  if (Blockly.selected) {
    workspace.centerOnBlock(Blockly.selected.id, true);
  }
}

function highlightBlock() {
  if (Blockly.selected) {
    workspace.highlightBlock(Blockly.selected.id, true);
  }
}

function unhighlightBlock() {
  if (Blockly.selected) {
    workspace.highlightBlock(Blockly.selected.id, false);
  }
}

function highlightBlockWarning() {
  if (Blockly.selected) {
    var block = workspace.getBlockById(Blockly.selected.id);
    if (block) {
      block.setHighlightWarning(true);
    }
  }
}

function unhighlightBlockWarning() {
  if (Blockly.selected) {
    var block = workspace.getBlockById(Blockly.selected.id);
    if (block) {
      block.setHighlightWarning(false);
    }
  }
}

function airstrike(n) {
  var prototypes = [];
  var toolbox = getToolboxElement();
  var blocks = toolbox.getElementsByTagName('block');
  for (var i = 0, block; block = blocks[i]; i++) {
    prototypes.push(block.getAttribute('type'));
  }
  for (var i = 0; i < n; i++) {
    var prototype = prototypes[Math.floor(Math.random() * prototypes.length)];
    var block = workspace.newBlock(prototype);
    block.initSvg();
    block.getSvgRoot().setAttribute('transform', 'translate(' +
        Math.round(Math.random() * 450 + 40) + ', ' +
        Math.round(Math.random() * 600 + 40) + ')');
    block.render();
  }
}

function toggleBreakpoints() {
  workspace.options.debugMode = !workspace.options.debugMode;
  var blocks = workspace.getAllBlocks();
  blocks.forEach(block => {
    if (block.nextConnection && block.previousConnection) {
      block.enableBreakpoint(workspace.options.debugMode);
    }
  });
}