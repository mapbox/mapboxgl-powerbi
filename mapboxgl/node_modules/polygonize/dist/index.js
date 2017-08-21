'use strict';

var Graph = require('./Graph'),
    EdgeRing = require('./EdgeRing'),
    _require = require('@turf/helpers'),
    featureCollection = _require.featureCollection;

/**
 * Polygonizes {@link LineString|(Multi)LineString(s)} into {@link Polygons}.
 *
 * Implementation of GEOSPolygonize function (`geos::operation::polygonize::Polygonizer`).
 *
 * Polygonizes a set of lines that represents edges in a planar graph. Edges must be correctly
 * noded, i.e., they must only meet at their endpoints.
 *
 * The implementation correctly handles:
 *
 * - Dangles: edges which have one or both ends which are not incident on another edge endpoint.
 * - Cut Edges (bridges): edges that are connected at both ends but which do not form part of a polygon.
 *
 * @name polygonize
 * @param {FeatureCollection|Geometry|Feature<LineString|MultiLineString>} geoJson Lines in order to polygonize
 * @returns {FeatureCollection<Polygon>} Polygons created
 * @throws {Error} if geoJson is invalid.
 */
module.exports = function polygonize(geoJson) {
  var graph = Graph.fromGeoJson(geoJson);

  // 1. Remove dangle node
  graph.deleteDangles();

  // 2. Remove cut-edges (bridge edges)
  graph.deleteCutEdges();

  // 3. Get all holes and shells
  var holes = [],
      shells = [];

  graph.getEdgeRings().filter(function (edgeRing) {
    return edgeRing.isValid();
  }).forEach(function (edgeRing) {
    if (edgeRing.isHole()) holes.push(edgeRing);else shells.push(edgeRing);
  });

  // 4. Assign Holes to Shells
  holes.forEach(function (hole) {
    if (EdgeRing.findEdgeRingContaining(hole, shells)) shells.push(hole);
  });

  // 5. EdgeRings to Polygons
  return featureCollection(shells.map(function (shell) {
    return shell.toPolygon();
  }));
};