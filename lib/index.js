"use strict";

var fs = require("graceful-fs");
var esprima = require("esprima");
var prettyPrintEsprimaParseError = require("esprima-pretty-error");

// this function is copied directly from esprima examples.
// Executes visitor on the object and its children (recursively).
function traverse(object, visitor, ancestors) {
  var key, child;
  ancestors = ancestors || [];
  ancestors.unshift(object);

  if (visitor.call(null, object, ancestors) === false) {
    return;
  }
  for (key in object) {
    if (object.hasOwnProperty(key)) {
      child = object[key];
      if (typeof child === "object" && child !== null) {
        traverse(child, visitor, ancestors);
      }
    }
  }
}

function readScript(scriptPath, cb) {
  fs.readFile(scriptPath, "utf8", function(err, js) {
    if (err) {
      return cb(err);
    }

    var ast;
    try {
      ast = esprima.parse(js);
    } catch (e) {
      prettyPrintEsprimaParseError(scriptPath);
      return cb(e);
    }
    cb(undefined, ast);
  });
}

function getValueOfFirstArgToRequire(node) {
  return (node &&
          node.type === "CallExpression" &&
          node.callee.name === "require" &&
          node.arguments[0].type === "Literal") ?
    node.arguments[0].value :
    undefined;
}

function extractRequireLiterals(scriptPath, cb) {
  var requireLiterals = [];

  readScript(scriptPath, function(err, ast) {
    if (err) {
      return cb(err);
    }

    var requireCounter = 0;

    traverse(ast, function (node, ancestors) {
      // if (node.type === "CallExpression" && node.callee.name === "require") {
      //   if (node.arguments[0].type === "Literal") {
      //     var value = node.arguments[0].value;
      //     requireLiterals.push(value);
      //     requireCounter--;
      //   }
      // }
      if (node.type === "Identifier" && node.name === "require") {
        requireCounter++;
        var value = getValueOfFirstArgToRequire(ancestors[1]);
        if (value) {
          requireLiterals.push(value);
          requireCounter--;
        }
      }
    });

    if (requireCounter > 0) {
      console.warn("WARNING: require token usage exceeds require literals estracted. Some requires may have been missed.");
      console.warn("File:", scriptPath);
      console.warn("Require Literals Detected:", requireLiterals);
      console.warn("Require Identifiers Found:", requireCounter);
    }

    cb(undefined, requireLiterals);
  });
}

module.exports = extractRequireLiterals;
