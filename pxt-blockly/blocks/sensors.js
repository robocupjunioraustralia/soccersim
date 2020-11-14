/**
 * @license
 * Copyright 2020 RoboCup Junior Australia
 */

/**
 * @fileoverview Blocks for a soccer simulation robot.
 */
'use strict';

goog.provide('Blockly.Blocks.sensors');

goog.require('Blockly');
goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.constants');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.FieldNumber');
goog.require('Blockly.FieldVariable');

goog.require('Blockly.PXTBlockly.Extensions');

Blockly.defineBlocksWithJsonArray([ // BEGIN JSON EXTRACT
  {
    "type": "ball_get_angle",
    "message0": "Ball angle",
    "output": "Number",
    "colour": 280,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "ball_get_distance",
    "message0": "Ball distance",
    "output": "Number",
    "colour": 280,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "compass_get_heading",
    "message0": "Robot heading",
    "output": "Number",
    "colour": 280,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "print",
    "message0": "Print %1",
    "args0": [{
      "type": "input_value",
      "name": "print_input",
      "check": "String"
    }],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "on_program_start",
    "message0": "Start %1",
    "args0": [{
      "type": "input_statement",
      "name": "start_input"
    }],
    // "colour": 230,
    "style": "hat_blocks",
    "tooltip": "",
    "helpUrl": ""
  }
]); // END JSON EXTRACT (Do not delete this comment.)

/*
Block factory library
https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#rd8tw2
*/