/**
 * @license
 * Copyright 2020 RoboCupJunior Australia
 */

/**
 * @fileoverview Generating JavaScript for soccer simulation blocks.
 */
'use strict';

goog.provide('Blockly.JavaScript.rcja');

goog.require('Blockly.JavaScript');


Blockly.JavaScript['motor_set_speed'] = function(block) {
  var arg = Blockly.JavaScript.valueToCode(block, 'NUM', Blockly.JavaScript.ORDER_NONE) || '0';
  var code = 'setMotorSpeed(' + arg + ');\n';
  return code;
};