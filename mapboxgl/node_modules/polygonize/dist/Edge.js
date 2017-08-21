'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('@turf/helpers'),
    lineString = _require.lineString,
    _require2 = require('./util'),
    orientationIndex = _require2.orientationIndex;

/** This class is inspired by GEOS's geos::operation::polygonize::PolygonizeDirectedEdge
 */


var Edge = function () {
  _createClass(Edge, [{
    key: 'getSymetric',

    /** Creates or get the symetric Edge.
     *
     * @returns {Edge} - Symetric Edge.
     */
    value: function getSymetric() {
      if (!this.symetric) {
        this.symetric = new Edge(this.to, this.from);
        this.symetric.symetric = this;
      }

      return this.symetric;
    }

    /**
     * @param {Node} from - start node of the Edge
     * @param {Node} to - end node of the edge
     */

  }]);

  function Edge(from, to) {
    _classCallCheck(this, Edge);

    this.from = from; //< start
    this.to = to; //< End

    this.next = undefined; //< The edge to be computed after
    this.label = undefined; //< Used in order to detect Cut Edges (Bridges)
    this.symetric = undefined; //< The symetric edge of this
    this.ring = undefined; //< EdgeRing in which the Edge is

    this.from.addOuterEdge(this);
    this.to.addInnerEdge(this);
  }

  /** Removes edge from from and to nodes.
   */


  _createClass(Edge, [{
    key: 'deleteEdge',
    value: function deleteEdge() {
      this.from.removeOuterEdge(this);
      this.to.removeInnerEdge(this);
    }

    /** Compares Edge equallity.
     * An edge is equal to another, if the from and to nodes are the same.
     *
     * @param {Edge} edge - Another Edge
     * @returns {Boolean} - True if Edges are equal, False otherwise
     */

  }, {
    key: 'isEqual',
    value: function isEqual(edge) {
      return this.from.id === edge.from.id && this.to.id === edge.to.id;
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'Edge { ' + this.from.id + ' -> ' + this.to.id + ' }';
    }

    /** Returns a LineString representation of the Edge
     *
     * @returns {Feature<LineString>} - LineString representation of the Edge
     */

  }, {
    key: 'toLineString',
    value: function toLineString() {
      return lineString([this.from.coordinates, this.to.coordinates]);
    }

    /** Comparator of two edges.
     * Implementation of geos::planargraph::DirectedEdge::compareTo.
     *
     * @param {Edge} edge - Another edge to compare with this one
     * @returns {Number} -1 if this Edge has a greater angle with the positive x-axis than b,
     *          0 if the Edges are colinear,
     *          1 otherwise
     */

  }, {
    key: 'compareTo',
    value: function compareTo(edge) {
      return orientationIndex(edge.from.coordinates, edge.to.coordinates, this.to.coordinates);
    }
  }]);

  return Edge;
}();

module.exports = Edge;