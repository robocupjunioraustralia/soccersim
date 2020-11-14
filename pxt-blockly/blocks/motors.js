/**
 * @license
 * Copyright 2020 RoboCup Junior Australia
 */

/**
 * @fileoverview Blocks for a soccer simulation robot.
 */
'use strict';

goog.provide('Blockly.Blocks.motors');

goog.require('Blockly');
goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.constants');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.FieldNumber');
goog.require('Blockly.FieldVariable');

goog.require('Blockly.PXTBlockly.Extensions');

var OPTIONS_MOTORS = [
  [ "Motor A", "'motorA'" ],
  [ "Motor B", "'motorB'" ],
  [ "Motor C", "'motorC'" ]
];

Blockly.defineBlocksWithJsonArray([  // BEGIN JSON EXTRACT
  {
    "type": "motor_stop",
    "message0": "Stop %1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "motor",
        "options": OPTIONS_MOTORS
      }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "Stops a motor",
    "helpUrl": ""
  },
  {
    "type": "motor_set_speed",
    "message0": "Set %1 speed to %2",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "motor",
        "options": OPTIONS_MOTORS
      },
      {
        "type": "input_value",
        "name": "speed_input",
        "check": "Number"
      }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "Starts a motor at a certain speed",
    "helpUrl": ""
  },
  {
    "type": "motor_get_speed",
    "message0": "%1 speed",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "motor",
        "options": OPTIONS_MOTORS
      }
    ],
    "output": "Number",
    "colour": 230,
    "tooltip": "",
    "helpUrl": "",
    "style": ""
  },
  {
    "type": "print",
    "message0": "Print %1",
    "args0": [
      {
        "type": "input_value",
        "name": "print_input",
        "check": "String"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "on_program_start",
    "message0": "Start %1",
    "args0": [
      {
        "type": "input_statement",
        "name": "start_input"
      }
    ],
    // "colour": 230,
    "style": "hat_blocks",
    "tooltip": "",
    "helpUrl": ""
  }
]);  // END JSON EXTRACT (Do not delete this comment.)

/*
Block factory library
https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#rd8tw2
*/