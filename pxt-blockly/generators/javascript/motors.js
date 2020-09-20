/**
 * @license
 * Copyright 2020 RoboCupJunior Australia
 */

/**
 * @fileoverview Generating JavaScript for soccer simulation blocks.
 */
'use strict';

goog.provide('Blockly.JavaScript.motors');

goog.require('Blockly.JavaScript');

Blockly.JavaScript['motor_set_speed'] = function(block) {
  var arg1 = block.getFieldValue('motor');
  var arg2 = Blockly.JavaScript.valueToCode(block, 'speed_input', Blockly.JavaScript.ORDER_ATOMIC) || '0';
  var code = 'setMotorSpeed(' + arg1 + ', ' + arg2 + ');\n';
  return code;
};

Blockly.JavaScript['motor_stop'] = function(block) {
  var arg1 = block.getFieldValue('motor');
  var code = 'stopMotor(' + arg1 + ');\n';
  return code;
};

Blockly.JavaScript['motor_get_speed'] = function(block) {
  var arg1 = block.getFieldValue('motor');
  var code = 'getMotorSpeed(' + arg1 + ')';
  return [code, Blockly.JavaScript.ORDER_NONE];
};