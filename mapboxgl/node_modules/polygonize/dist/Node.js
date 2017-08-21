'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('./util'),
    orientationIndex = _require.orientationIndex;

var Node = function () {
  _createClass(Node, null, [{
    key: 'buildId',
    value: function buildId(coordinates) {
      return coordinates.join(',');
    }
  }]);

  function Node(coordinates) {
    _classCallCheck(this, Node);

    this.id = Node.buildId(coordinates);
    this.coordinates = coordinates; //< {Number[]}
    this.innerEdges = []; //< {Edge[]}

    // We wil store to (out) edges in an CCW order as geos::planargraph::DirectedEdgeStar does
    this.outerEdges = []; //< {Edge[]}
    this.outerEdgesSorted = false; //< {Boolean} flag that stores if the outer Edges had been sorted
  }

  _createClass(Node, [{
    key: 'removeInnerEdge',
    value: function removeInnerEdge(edge) {
      this.innerEdges = this.innerEdges.filter(function (e) {
        return e.from.id !== edge.from.id;
      });
    }
  }, {
    key: 'removeOuterEdge',
    value: function removeOuterEdge(edge) {
      this.outerEdges = this.outerEdges.filter(function (e) {
        return e.to.id !== edge.to.id;
      });
    }

    /** Outer edges are stored CCW order.
     * @param {Edge} edge - Edge to add as an outerEdge.
     */

  }, {
    key: 'addOuterEdge',
    value: function addOuterEdge(edge) {
      this.outerEdges.push(edge);
      this.outerEdgesSorted = false;
    }

    /** Sorts outer edges in CCW way.
     * @private
     */

  }, {
    key: 'sortOuterEdges',
    value: function sortOuterEdges() {
      var _this = this;

      if (!this.outerEdgesSorted) {
        //this.outerEdges.sort((a, b) => a.compareTo(b));
        // Using this comparator in order to be deterministic
        this.outerEdges.sort(function (a, b) {
          var aNode = a.to,
              bNode = b.to;

          if (aNode.coordinates[0] - _this.coordinates[0] >= 0 && bNode.coordinates[0] - _this.coordinates[0] < 0) return 1;
          if (aNode.coordinates[0] - _this.coordinates[0] < 0 && bNode.coordinates[0] - _this.coordinates[0] >= 0) return -1;

          if (aNode.coordinates[0] - _this.coordinates[0] === 0 && bNode.coordinates[0] - _this.coordinates[0] === 0) {
            if (aNode.coordinates[1] - _this.coordinates[1] >= 0 || bNode.coordinates[1] - _this.coordinates[1] >= 0) return aNode.coordinates[1] - bNode.coordinates[1];
            return bNode.coordinates[1] - aNode.coordinates[1];
          }

          var det = orientationIndex(_this.coordinates, aNode.coordinates, bNode.coordinates);
          if (det < 0) return 1;
          if (det > 0) return -1;

          var d1 = Math.pow(aNode.coordinates[0] - _this.coordinates[0], 2) + Math.pow(aNode.coordinates[1] - _this.coordinates[1], 2),
              d2 = Math.pow(bNode.coordinates[0] - _this.coordinates[0], 2) + Math.pow(bNode.coordinates[1] - _this.coordinates[1], 2);

          return d1 - d2;
        });
        this.outerEdgesSorted = true;
      }
    }

    /** Retrieves outer edges.
     * They are sorted if they aren't in the CCW order.
     * @returns {Edge[]} - List of outer edges sorted in a CCW order.
     */

  }, {
    key: 'getOuterEdges',
    value: function getOuterEdges() {
      this.sortOuterEdges();
      return this.outerEdges;
    }
  }, {
    key: 'getOuterEdge',
    value: function getOuterEdge(i) {
      this.sortOuterEdges();
      return this.outerEdges[i];
    }
  }, {
    key: 'addInnerEdge',
    value: function addInnerEdge(edge) {
      this.innerEdges.push(edge);
    }
  }]);

  return Node;
}();

module.exports = Node;