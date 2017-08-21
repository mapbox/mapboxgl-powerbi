'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Node = require('./Node'),
    Edge = require('./Edge'),
    EdgeRing = require('./EdgeRing'),
    _require = require('@turf/meta'),
    flattenEach = _require.flattenEach,
    coordReduce = _require.coordReduce,
    _require2 = require('@turf/invariant'),
    featureOf = _require2.featureOf;

/** Validates the geoJson.
 *
 * @param {Geojson} geoJson - input geoJson.
 * @throws {Error} if geoJson is invalid.
 */
function validateGeoJson(geoJson) {
  if (!geoJson) throw new Error('No geojson passed');

  if (geoJson.type !== 'FeatureCollection' && geoJson.type !== 'GeometryCollection' && geoJson.type !== 'MultiLineString' && geoJson.type !== 'LineString' && geoJson.type !== 'Feature') throw new Error('Invalid input type \'' + geoJson.type + '\'. Geojson must be FeatureCollection, GeometryCollection, LineString, MultiLineString or Feature');
}

/** Represents a planar graph of edges and nodes that can be used to compute a
 * polygonization.
 *
 * Although, this class is inspired by GEOS's `geos::operation::polygonize::PolygonizeGraph`,
 * it isn't a rewrite. As regards algorithm, this class implements the same logic, but it
 * isn't a javascript transcription of the C++ source.
 *
 * This graph is directed (both directions are created)
 */

var Graph = function () {
  _createClass(Graph, [{
    key: 'getNode',


    /** Creates or get a Node.
     *
     * @param {Number[]} coordinates - Coordinates of the node
     * @returns {Node} - The created or stored node
     */
    value: function getNode(coordinates) {
      var id = Node.buildId(coordinates);
      var node = this.nodes[id];
      if (!node) node = this.nodes[id] = new Node(coordinates);

      return node;
    }

    /** Adds an Edge and its symetricall.
     * Edges are added symetrically, i.e.: we also add its symetric
     *
     * @param {Node} from - Node which starts the Edge
     * @param {Node} to - Node which ends the Edge
     */

  }, {
    key: 'addEdge',
    value: function addEdge(from, to) {
      var edge = new Edge(from, to),
          symetricEdge = edge.getSymetric();

      this.edges.push(edge);
      this.edges.push(symetricEdge);
    }
  }], [{
    key: 'fromGeoJson',

    /** Creates a graph from a GeoJSON.
     *
     * @param {FeatureCollection<LineString>} geoJson - it must comply with the restrictions detailed in the index
     * @returns {Graph} - The newly created graph
     * @throws {Error} if geoJson is invalid.
     */
    value: function fromGeoJson(geoJson) {
      validateGeoJson(geoJson);

      var graph = new Graph();
      flattenEach(geoJson, function (feature) {
        featureOf(feature, 'LineString', 'Graph::fromGeoJson');
        // When a LineString if formed by many segments, split them
        coordReduce(feature, function (prev, cur) {
          if (prev) {
            var start = graph.getNode(prev),
                end = graph.getNode(cur);

            graph.addEdge(start, end);
          }
          return cur;
        });
      });

      return graph;
    }
  }]);

  function Graph() {
    _classCallCheck(this, Graph);

    this.edges = []; //< {Edge[]} dirEdges

    // The key is the `id` of the Node (ie: coordinates.join(','))
    this.nodes = {};
  }

  /** Removes Dangle Nodes (nodes with grade 1).
   */


  _createClass(Graph, [{
    key: 'deleteDangles',
    value: function deleteDangles() {
      var _this = this;

      Object.keys(this.nodes).map(function (id) {
        return _this.nodes[id];
      }).forEach(function (node) {
        return _this._removeIfDangle(node);
      });
    }

    /** Check if node is dangle, if so, remove it.
     * It calls itself recursively, removing a dangling node might cause another dangling node
     *
     * @param {Node} node - Node to check if it's a dangle
     */

  }, {
    key: '_removeIfDangle',
    value: function _removeIfDangle(node) {
      var _this2 = this;

      // As edges are directed and symetrical, we count only innerEdges
      if (node.innerEdges.length <= 1) {
        var outerNodes = node.getOuterEdges().map(function (e) {
          return e.to;
        });
        this.removeNode(node);
        outerNodes.forEach(function (n) {
          return _this2._removeIfDangle(n);
        });
      }
    }

    /** Delete cut-edges (bridge edges).
     *
     * The graph will be traversed, all the edges will be labeled according the ring
     * in which they are. (The label is a number incremented by 1). Edges with the same
     * label are cut-edges.
     */

  }, {
    key: 'deleteCutEdges',
    value: function deleteCutEdges() {
      var _this3 = this;

      this._computeNextCWEdges();
      this._findLabeledEdgeRings();

      // Cut-edges (bridges) are edges where both edges have the same label
      this.edges.forEach(function (edge) {
        if (edge.label === edge.symetric.label) {
          _this3.removeEdge(edge.symetric);
          _this3.removeEdge(edge);
        }
      });
    }

    /** Set the `next` property of each Edge.
     * The graph will be transversed in a CW form, so, we set the next of the symetrical edge as the previous one.
     * OuterEdges are sorted CCW.
     *
     * @param {Node} [node] - If no node is passed, the function calls itself for every node in the Graph
     */

  }, {
    key: '_computeNextCWEdges',
    value: function _computeNextCWEdges(node) {
      var _this4 = this;

      if (typeof node === 'undefined') {
        Object.keys(this.nodes).forEach(function (id) {
          return _this4._computeNextCWEdges(_this4.nodes[id]);
        });
      } else {
        node.getOuterEdges().forEach(function (edge, i) {
          node.getOuterEdge((i === 0 ? node.getOuterEdges().length : i) - 1).symetric.next = edge;
        });
      }
    }

    /** Computes the next edge pointers going CCW around the given node, for the given edgering label.
     * This algorithm has the effect of converting maximal edgerings into minimal edgerings
     *
     * XXX: method literally transcribed from `geos::operation::polygonize::PolygonizeGraph::computeNextCCWEdges`,
     * could be written in a more javascript way.
     *
     * @param {Node} node - Node
     * @param {Number} label - Ring's label
     */

  }, {
    key: '_computeNextCCWEdges',
    value: function _computeNextCCWEdges(node, label) {
      var edges = node.getOuterEdges();
      var firstOutDE = void 0,
          prevInDE = void 0;

      for (var i = edges.length - 1; i >= 0; --i) {
        var de = edges[i],
            sym = de.symetric,
            outDE = void 0,
            inDE = void 0;

        if (de.label === label) outDE = de;

        if (sym.label === label) inDE = sym;

        if (!outDE || !inDE) // This edge is not in edgering
          continue;

        if (inDE) prevInDE = inDE;

        if (outDE) {
          if (prevInDE) {
            prevInDE.next = outDE;
            prevInDE = undefined;
          }

          if (!firstOutDE) firstOutDE = outDE;
        }
      }

      if (prevInDE) prevInDE.next = firstOutDE;
    }

    /** Finds rings and labels edges according to which rings are.
     * The label is a number which is increased for each ring.
     *
     * @returns {Edge[]} edges that start rings
     */

  }, {
    key: '_findLabeledEdgeRings',
    value: function _findLabeledEdgeRings() {
      var edgeRingStarts = [];
      var label = 0;
      this.edges.forEach(function (edge) {
        if (edge.label >= 0) return;

        edgeRingStarts.push(edge);

        var e = edge;
        do {
          e.label = label;
          e = e.next;
        } while (!edge.isEqual(e));

        label++;
      });

      return edgeRingStarts;
    }

    /** Computes the EdgeRings formed by the edges in this graph.
     *
     * @returns {EdgeRing[]} - A list of all the EdgeRings in the graph.
     */

  }, {
    key: 'getEdgeRings',
    value: function getEdgeRings() {
      var _this5 = this;

      this._computeNextCWEdges();

      // Clear labels
      this.edges.forEach(function (edge) {
        edge.label = undefined;
      });

      this._findLabeledEdgeRings().forEach(function (edge) {
        // convertMaximalToMinimalEdgeRings
        _this5._findIntersectionNodes(edge).forEach(function (node) {
          _this5._computeNextCCWEdges(node, edge.label);
        });
      });

      var edgeRingList = [];

      // find all edgerings
      this.edges.forEach(function (edge) {
        if (edge.ring) return;
        edgeRingList.push(_this5._findEdgeRing(edge));
      });

      return edgeRingList;
    }

    /** Find all nodes in a Maxima EdgeRing which are self-intersection nodes.
     *
     * @param {Node} startEdge - Start Edge of the Ring
     * @returns {Node[]} - intersection nodes
     */

  }, {
    key: '_findIntersectionNodes',
    value: function _findIntersectionNodes(startEdge) {
      var intersectionNodes = [];
      var edge = startEdge;

      var _loop = function _loop() {
        // getDegree
        var degree = 0;
        edge.from.getOuterEdges().forEach(function (e) {
          if (e.label === startEdge.label) ++degree;
        });

        if (degree > 1) intersectionNodes.push(edge.from);

        edge = edge.next;
      };

      do {
        _loop();
      } while (!startEdge.isEqual(edge));

      return intersectionNodes;
    }

    /** Get the edge-ring which starts from the provided Edge.
     *
     * @param {Edge} startEdge - starting edge of the edge ring
     * @returns {EdgeRing} - EdgeRing which start Edge is the provided one.
     */

  }, {
    key: '_findEdgeRing',
    value: function _findEdgeRing(startEdge) {
      var edge = startEdge;
      var edgeRing = new EdgeRing();

      do {
        edgeRing.push(edge);
        edge.ring = edgeRing;
        edge = edge.next;
      } while (!startEdge.isEqual(edge));

      return edgeRing;
    }

    /** Removes a node from the Graph.
     *
     * It also removes edges asociated to that node
     * @param {Node} node - Node to be removed
     */

  }, {
    key: 'removeNode',
    value: function removeNode(node) {
      var _this6 = this;

      node.getOuterEdges().forEach(function (edge) {
        return _this6.removeEdge(edge);
      });
      node.innerEdges.forEach(function (edge) {
        return _this6.removeEdge(edge);
      });
      delete this.nodes[node.id];
    }

    /** Remove edge from the graph and deletes the edge.
     *
     * @param {Edge} edge - Edge to be removed
     */

  }, {
    key: 'removeEdge',
    value: function removeEdge(edge) {
      this.edges = this.edges.filter(function (e) {
        return !e.isEqual(edge);
      });
      edge.deleteEdge();
    }
  }]);

  return Graph;
}();

module.exports = Graph;