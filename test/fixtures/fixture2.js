/**
 * In ForbesLindesay's ajax package, he attempts hide a component require from
 * browserify. This messes up our approach of more smartly resolving component
 * requires.
 *
 * Here is this hack in the wild:
 * https://github.com/ForbesLindesay/ajax/blob/master/index.js#L1
 */

var type;
try {
  type = require("type-of");
} catch (e) {
  //hide from browserify
  var r = require;
  type = r("type");
}
