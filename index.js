var fs = require("graceful-fs");
var esprima = require("esprima");
var prettyPrintEsprimaParseError = require("esprima-pretty-error");

// this function is copied directly from esprima examples.
// Executes visitor on the object and its children (recursively).
function traverse(object, visitor) {
  var key, child;

  if (visitor.call(null, object) === false) {
    return;
  }
  for (key in object) {
    if (object.hasOwnProperty(key)) {
      child = object[key];
      if (typeof child === 'object' && child !== null) {
        traverse(child, visitor);
      }
    }
  }
}

function extractRequireLiterals(scriptPath, cb) {
  var requireLiterals = [];

  fs.readFile(scriptPath, 'utf8', function(err, js) {
    if (err) return console.error(err);

    var ast;
    try {
      ast = esprima.parse(js);
    } catch (e) {
      prettyPrintEsprimaParseError(scriptPath);
      return cb(e);
    }

    traverse(ast, function (node) {
      if (node.type === 'CallExpression' && node.callee.name === "require") {
        if (node.arguments[0].type === "Literal") {
          var value = node.arguments[0].value;
          requireLiterals.push(value);
        }
      }
    });

    cb(undefined, requireLiterals);
  });
}

module.exports = extractRequireLiterals;
