'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('./util'),
    orientationIndex = _require.orientationIndex,
    envelopeIsEqual = _require.envelopeIsEqual,
    envelopeContains = _require.envelopeContains,
    coordinatesEqual = _require.coordinatesEqual,
    _require2 = require('@turf/helpers'),
    multiPoint = _require2.multiPoint,
    polygon = _require2.polygon,
    point = _require2.point,
    envelope = require('@turf/envelope'),
    _inside = require('@turf/inside');

/** Ring of edges which form a polygon.
 * The ring may be either an outer shell or a hole.
 *
 * This class is inspired in GEOS's geos::operation::polygonize::EdgeRing
 */


var EdgeRing = function () {
  function EdgeRing() {
    _classCallCheck(this, EdgeRing);

    this.edges = [];
    this.polygon = undefined; //< Caches Polygon representation
    this.envelope = undefined; //< Caches Envelope representation
  }

  /** Add an edge to the ring, inserting it in the last position.
   *
   * @param {Edge} edge - Edge to be inserted
   */


  _createClass(EdgeRing, [{
    key: 'push',
    value: function push(edge) {
      // Emulate Array getter ([]) behaviour
      this[this.edges.length] = edge;
      this.edges.push(edge);
      this.polygon = this.envelope = undefined;
    }

    /** Get Edge.
     *
     * @param {Number} i - Index
     * @returns {Edge} - Edge in the i position
     */

  }, {
    key: 'get',
    value: function get(i) {
      return this.edges[i];
    }

    /** Getter of length property.
     *
     * @returns {Number} - Length of the edge ring.
     */

  }, {
    key: 'forEach',


    /** Similar to Array.prototype.forEach for the list of Edges in the EdgeRing.
     *
     * @param {Function} f - The same function to be passed to Array.prototype.forEach
     */
    value: function forEach(f) {
      this.edges.forEach(f);
    }

    /** Similar to Array.prototype.map for the list of Edges in the EdgeRing.
     *
     * @param {Function} f - The same function to be passed to Array.prototype.map
     * @returns {Array} - The mapped values in the function
     */

  }, {
    key: 'map',
    value: function map(f) {
      return this.edges.map(f);
    }

    /** Similar to Array.prototype.some for the list of Edges in the EdgeRing.
     *
     * @param {Function} f - The same function to be passed to Array.prototype.some
     * @returns {Boolean} - True if an Edge check the condition
     */

  }, {
    key: 'some',
    value: function some(f) {
      return this.edges.some(f);
    }

    /** Check if the ring is valid in geomtry terms.
     * A ring must have either 0 or 4 or more points. The first and the last must be
     * equal (in 2D)
     * geos::geom::LinearRing::validateConstruction
     *
     * @returns {Boolean} - Validity of the EdgeRing
     */

  }, {
    key: 'isValid',
    value: function isValid() {
      // TODO: stub
      return true;
    }

    /** Tests whether this ring is a hole.
     * A ring is a hole if it is oriented counter-clockwise.
     * Similar implementation of geos::algorithm::CGAlgorithms::isCCW
     * @returns {Boolean} - true: if it is a hole
     */

  }, {
    key: 'isHole',
    value: function isHole() {
      var _this = this;

      // XXX: Assuming Ring is valid
      // Find highest point
      var hiIndex = this.edges.reduce(function (high, edge, i) {
        if (edge.from.coordinates[1] > _this.edges[high].from.coordinates[1]) high = i;
        return high;
      }, 0),
          iPrev = (hiIndex === 0 ? this.length : hiIndex) - 1,
          iNext = (hiIndex + 1) % this.length,
          disc = orientationIndex(this.edges[iPrev].from.coordinates, this.edges[hiIndex].from.coordinates, this.edges[iNext].from.coordinates);

      if (disc === 0) return this.edges[iPrev].from.coordinates[0] > this.edges[iNext].from.coordinates[0];
      return disc > 0;
    }

    /** Creates a MultiPoint representing the EdgeRing (discarts edges directions).
     * @returns {Feature<MultiPoint>} - Multipoint representation of the EdgeRing
     */

  }, {
    key: 'toMultiPoint',
    value: function toMultiPoint() {
      return multiPoint(this.edges.map(function (edge) {
        return edge.from.coordinates;
      }));
    }

    /** Creates a Polygon representing the EdgeRing.
     * @returns {Feature<Polygon>} - Polygon representation of the Edge Ring
     */

  }, {
    key: 'toPolygon',
    value: function toPolygon() {
      if (this.polygon) return this.polygon;
      var coordinates = this.edges.map(function (edge) {
        return edge.from.coordinates;
      });
      coordinates.push(this.edges[0].from.coordinates);
      return this.polygon = polygon([coordinates]);
    }

    /** Calculates the envelope of the EdgeRing.
     * @returns {Feature<Polygon>} - envelope
     */

  }, {
    key: 'getEnvelope',
    value: function getEnvelope() {
      if (this.envelope) return this.envelope;
      return this.envelope = envelope(this.toPolygon());
    }

    /**
     * `geos::operation::polygonize::EdgeRing::findEdgeRingContaining`
     *
     * @param {EdgeRing} testEdgeRing - EdgeRing to look in the list
     * @param {EdgeRing[]} shellList - List of EdgeRing in which to search
     *
     * @returns {EdgeRing} - EdgeRing which contains the testEdgeRing
     */

  }, {
    key: 'inside',


    /** Checks if the point is inside the edgeRing
     *
     * @param {Feature<Point>} point - Point to check if it is inside the edgeRing
     * @returns {Boolean} - True if it is inside, False otherwise
     */
    value: function inside(point) {
      return _inside(point, this.toPolygon());
    }
  }, {
    key: 'length',
    get: function get() {
      return this.edges.length;
    }
  }], [{
    key: 'findEdgeRingContaining',
    value: function findEdgeRingContaining(testEdgeRing, shellList) {
      var testEnvelope = testEdgeRing.getEnvelope();

      var minEnvelope = void 0,
          minShell = void 0;
      shellList.forEach(function (shell) {
        var tryEnvelope = shell.getEnvelope();

        if (minShell) minEnvelope = minShell.getEnvelope();

        // the hole envelope cannot equal the shell envelope
        if (envelopeIsEqual(tryEnvelope, testEnvelope)) return;

        if (envelopeContains(tryEnvelope, testEnvelope)) {
          var testPoint = testEdgeRing.map(function (edge) {
            return edge.from.coordinates;
          }).find(function (pt) {
            return !shell.some(function (edge) {
              return coordinatesEqual(pt, edge.from.coordinates);
            });
          });

          if (testPoint && shell.inside(point(testPoint))) {
            if (!minShell || envelopeContains(minEnvelope, tryEnvelope)) minShell = shell;
          }
        }
      });

      return minShell;
    }
  }]);

  return EdgeRing;
}();

module.exports = EdgeRing;