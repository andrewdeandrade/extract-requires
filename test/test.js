/*global describe it*/

var path = require("path");
var fs = require("graceful-fs");
var assert = require("assert");
var _ = require("underscore");

var extractRequires = require("../lib/");

describe("extract-requires", function(){
  "use strict";

  it("Simple test", function(done) {
    var fixture = path.join(__dirname, "fixtures", "fixture1.js");
    extractRequires(fixture, function(err, requireLiterals) {
      var expectedRequires = ["foo-module", "bar-module", "baz-module"];

      expectedRequires.forEach(function(expected) {
        assert.ok(_.contains(requireLiterals, expected), "Expected requireLiterals to contain " + expected);
      });

      done();
    });
  });

  it("ForbesLindesay/ajax hack", function(done) {
    var fixture = path.join(__dirname, "fixtures", "fixture2.js");
    extractRequires(fixture, function(err, requireLiterals) {
      // var expectedRequires = ["foo-module", "bar-module", "baz-module"];

      // expectedRequires.forEach(function(expected) {
      //   assert.ok(_.contains(requireLiterals, expected), "Expected requireLiterals to contain " + expected);
      // });

      done();
    });
  });

});
