/**
 * @license
 * Copyright 2020 RoboCupJunior Australia
 */

/**
 * @fileoverview Blocks for a soccer simulation robot.
 */
'use strict';

goog.provide('Blockly.Blocks.rcja');

goog.require('Blockly');
goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.constants');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.FieldNumber');
goog.require('Blockly.FieldVariable');

goog.require('Blockly.PXTBlockly.Extensions');

Blockly.defineBlocksWithJsonArray([  // BEGIN JSON EXTRACT
  // Example block
  {
    "type": "motor_set_speed",
    "message0": "Set motor speed %1",
    "args0": [
    {
      "type": "input_value",
      "name": "NUM",
      "check": "Number"
    }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "EV3 Motor",
    "helpUrl": ""
  }
]);  // END JSON EXTRACT (Do not delete this comment.)
