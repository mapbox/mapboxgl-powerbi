(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.gridToMatrix = factory());
}(this, (function () {

/**
 * Unwrap a coordinate from a Point Feature, Geometry or a single coordinate.
 *
 * @name getCoord
 * @param {Array<any>|Geometry|Feature<Point>} obj any value
 * @returns {Array<number>} coordinates
 */
function getCoord(obj) {
    if (!obj) throw new Error('No obj passed');

    var coordinates = getCoords$1(obj);

    // getCoord() must contain at least two numbers (Point)
    if (coordinates.length > 1 &&
        typeof coordinates[0] === 'number' &&
        typeof coordinates[1] === 'number') {
        return coordinates;
    } else {
        throw new Error('Coordinate is not a valid Point');
    }
}

/**
 * Unwrap coordinates from a Feature, Geometry Object or an Array of numbers
 *
 * @name getCoords
 * @param {Array<any>|Geometry|Feature<any>} obj any value
 * @returns {Array<any>} coordinates
 */
function getCoords$1(obj) {
    if (!obj) throw new Error('No obj passed');
    var coordinates;

    // Array of numbers
    if (obj.length) {
        coordinates = obj;

    // Geometry Object
    } else if (obj.coordinates) {
        coordinates = obj.coordinates;

    // Feature
    } else if (obj.geometry && obj.geometry.coordinates) {
        coordinates = obj.geometry.coordinates;
    }
    // Checks if coordinates contains a number
    if (coordinates) {
        containsNumber(coordinates);
        return coordinates;
    }
    throw new Error('No valid coordinates');
}

/**
 * Checks if coordinates contains a number
 *
 * @name containsNumber
 * @param {Array<any>} coordinates GeoJSON Coordinates
 * @returns {boolean} true if Array contains a number
 */
function containsNumber(coordinates) {
    if (coordinates.length > 1 &&
        typeof coordinates[0] === 'number' &&
        typeof coordinates[1] === 'number') {
        return true;
    }

    if (Array.isArray(coordinates[0]) && coordinates[0].length) {
        return containsNumber(coordinates[0]);
    }
    throw new Error('coordinates must only contain numbers');
}

/**
 * Enforce expectations about types of GeoJSON objects for Turf.
 *
 * @name geojsonType
 * @param {GeoJSON} value any GeoJSON object
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} if value is not the expected type.
 */
function geojsonType(value, type, name) {
    if (!type || !name) throw new Error('type and name required');

    if (!value || value.type !== type) {
        throw new Error('Invalid input to ' + name + ': must be a ' + type + ', given ' + value.type);
    }
}

/**
 * Enforce expectations about types of {@link Feature} inputs for Turf.
 * Internally this uses {@link geojsonType} to judge geometry types.
 *
 * @name featureOf
 * @param {Feature} feature a feature with an expected geometry type
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} error if value is not the expected type.
 */
function featureOf(feature, type, name) {
    if (!feature) throw new Error('No feature passed');
    if (!name) throw new Error('.featureOf() requires a name');
    if (!feature || feature.type !== 'Feature' || !feature.geometry) {
        throw new Error('Invalid input to ' + name + ', Feature with geometry required');
    }
    if (!feature.geometry || feature.geometry.type !== type) {
        throw new Error('Invalid input to ' + name + ': must be a ' + type + ', given ' + feature.geometry.type);
    }
}

/**
 * Enforce expectations about types of {@link FeatureCollection} inputs for Turf.
 * Internally this uses {@link geojsonType} to judge geometry types.
 *
 * @name collectionOf
 * @param {FeatureCollection} featureCollection a FeatureCollection for which features will be judged
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} if value is not the expected type.
 */
function collectionOf(featureCollection, type, name) {
    if (!featureCollection) throw new Error('No featureCollection passed');
    if (!name) throw new Error('.collectionOf() requires a name');
    if (!featureCollection || featureCollection.type !== 'FeatureCollection') {
        throw new Error('Invalid input to ' + name + ', FeatureCollection required');
    }
    for (var i = 0; i < featureCollection.features.length; i++) {
        var feature = featureCollection.features[i];
        if (!feature || feature.type !== 'Feature' || !feature.geometry) {
            throw new Error('Invalid input to ' + name + ', Feature with geometry required');
        }
        if (!feature.geometry || feature.geometry.type !== type) {
            throw new Error('Invalid input to ' + name + ': must be a ' + type + ', given ' + feature.geometry.type);
        }
    }
}

var index$2 = {
    geojsonType: geojsonType,
    collectionOf: collectionOf,
    featureOf: featureOf,
    getCoord: getCoord,
    getCoords: getCoords$1,
    containsNumber: containsNumber
};

/**
 * Callback for coordEach
 *
 * @private
 * @callback coordEachCallback
 * @param {[number, number]} currentCoords The current coordinates being processed.
 * @param {number} currentIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 */

/**
 * Iterate over coordinates in any GeoJSON object, similar to Array.forEach()
 *
 * @name coordEach
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (currentCoords, currentIndex)
 * @param {boolean} [excludeWrapCoord=false] whether or not to include
 * the final coordinate of LinearRings that wraps the ring in its iteration.
 * @example
 * var features = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [26, 37]
 *       }
 *     },
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [36, 53]
 *       }
 *     }
 *   ]
 * };
 * turf.coordEach(features, function (currentCoords, currentIndex) {
 *   //=currentCoords
 *   //=currentIndex
 * });
 */
function coordEach(layer, callback, excludeWrapCoord) {
    var i, j, k, g, l, geometry, stopG, coords,
        geometryMaybeCollection,
        wrapShrink = 0,
        currentIndex = 0,
        isGeometryCollection,
        isFeatureCollection = layer.type === 'FeatureCollection',
        isFeature = layer.type === 'Feature',
        stop = isFeatureCollection ? layer.features.length : 1;

  // This logic may look a little weird. The reason why it is that way
  // is because it's trying to be fast. GeoJSON supports multiple kinds
  // of objects at its root: FeatureCollection, Features, Geometries.
  // This function has the responsibility of handling all of them, and that
  // means that some of the `for` loops you see below actually just don't apply
  // to certain inputs. For instance, if you give this just a
  // Point geometry, then both loops are short-circuited and all we do
  // is gradually rename the input until it's called 'geometry'.
  //
  // This also aims to allocate as few resources as possible: just a
  // few numbers and booleans, rather than any temporary arrays as would
  // be required with the normalization approach.
    for (i = 0; i < stop; i++) {

        geometryMaybeCollection = (isFeatureCollection ? layer.features[i].geometry :
        (isFeature ? layer.geometry : layer));
        isGeometryCollection = geometryMaybeCollection.type === 'GeometryCollection';
        stopG = isGeometryCollection ? geometryMaybeCollection.geometries.length : 1;

        for (g = 0; g < stopG; g++) {
            geometry = isGeometryCollection ?
            geometryMaybeCollection.geometries[g] : geometryMaybeCollection;
            coords = geometry.coordinates;

            wrapShrink = (excludeWrapCoord &&
                (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon')) ?
                1 : 0;

            if (geometry.type === 'Point') {
                callback(coords, currentIndex);
                currentIndex++;
            } else if (geometry.type === 'LineString' || geometry.type === 'MultiPoint') {
                for (j = 0; j < coords.length; j++) {
                    callback(coords[j], currentIndex);
                    currentIndex++;
                }
            } else if (geometry.type === 'Polygon' || geometry.type === 'MultiLineString') {
                for (j = 0; j < coords.length; j++)
                    for (k = 0; k < coords[j].length - wrapShrink; k++) {
                        callback(coords[j][k], currentIndex);
                        currentIndex++;
                    }
            } else if (geometry.type === 'MultiPolygon') {
                for (j = 0; j < coords.length; j++)
                    for (k = 0; k < coords[j].length; k++)
                        for (l = 0; l < coords[j][k].length - wrapShrink; l++) {
                            callback(coords[j][k][l], currentIndex);
                            currentIndex++;
                        }
            } else if (geometry.type === 'GeometryCollection') {
                for (j = 0; j < geometry.geometries.length; j++)
                    coordEach(geometry.geometries[j], callback, excludeWrapCoord);
            } else {
                throw new Error('Unknown Geometry Type');
            }
        }
    }
}

/**
 * Callback for coordReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @private
 * @callback coordReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {[number, number]} currentCoords The current coordinate being processed.
 * @param {number} currentIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 */

/**
 * Reduce coordinates in any GeoJSON object, similar to Array.reduce()
 *
 * @name coordReduce
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentCoords, currentIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @param {boolean} [excludeWrapCoord=false] whether or not to include
 * the final coordinate of LinearRings that wraps the ring in its iteration.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [26, 37]
 *       }
 *     },
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [36, 53]
 *       }
 *     }
 *   ]
 * };
 * turf.coordReduce(features, function (previousValue, currentCoords, currentIndex) {
 *   //=previousValue
 *   //=currentCoords
 *   //=currentIndex
 *   return currentCoords;
 * });
 */
function coordReduce(layer, callback, initialValue, excludeWrapCoord) {
    var previousValue = initialValue;
    coordEach(layer, function (currentCoords, currentIndex) {
        if (currentIndex === 0 && initialValue === undefined) {
            previousValue = currentCoords;
        } else {
            previousValue = callback(previousValue, currentCoords, currentIndex);
        }
    }, excludeWrapCoord);
    return previousValue;
}

/**
 * Callback for propEach
 *
 * @private
 * @callback propEachCallback
 * @param {*} currentProperties The current properties being processed.
 * @param {number} currentIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 */

/**
 * Iterate over properties in any GeoJSON object, similar to Array.forEach()
 *
 * @name propEach
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (currentProperties, currentIndex)
 * @example
 * var features = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     {
 *       "type": "Feature",
 *       "properties": {"foo": "bar"},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [26, 37]
 *       }
 *     },
 *     {
 *       "type": "Feature",
 *       "properties": {"hello": "world"},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [36, 53]
 *       }
 *     }
 *   ]
 * };
 * turf.propEach(features, function (currentProperties, currentIndex) {
 *   //=currentProperties
 *   //=currentIndex
 * });
 */
function propEach(layer, callback) {
    var i;
    switch (layer.type) {
    case 'FeatureCollection':
        for (i = 0; i < layer.features.length; i++) {
            callback(layer.features[i].properties, i);
        }
        break;
    case 'Feature':
        callback(layer.properties, 0);
        break;
    }
}


/**
 * Callback for propReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @private
 * @callback propReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {*} currentProperties The current properties being processed.
 * @param {number} currentIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 */

/**
 * Reduce properties in any GeoJSON object into a single value,
 * similar to how Array.reduce works. However, in this case we lazily run
 * the reduction, so an array of all properties is unnecessary.
 *
 * @name propReduce
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentProperties, currentIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     {
 *       "type": "Feature",
 *       "properties": {"foo": "bar"},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [26, 37]
 *       }
 *     },
 *     {
 *       "type": "Feature",
 *       "properties": {"hello": "world"},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [36, 53]
 *       }
 *     }
 *   ]
 * };
 * turf.propReduce(features, function (previousValue, currentProperties, currentIndex) {
 *   //=previousValue
 *   //=currentProperties
 *   //=currentIndex
 *   return currentProperties
 * });
 */
function propReduce(layer, callback, initialValue) {
    var previousValue = initialValue;
    propEach(layer, function (currentProperties, currentIndex) {
        if (currentIndex === 0 && initialValue === undefined) {
            previousValue = currentProperties;
        } else {
            previousValue = callback(previousValue, currentProperties, currentIndex);
        }
    });
    return previousValue;
}

/**
 * Callback for featureEach
 *
 * @private
 * @callback featureEachCallback
 * @param {Feature<any>} currentFeature The current feature being processed.
 * @param {number} currentIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 */

/**
 * Iterate over features in any GeoJSON object, similar to
 * Array.forEach.
 *
 * @name featureEach
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (currentFeature, currentIndex)
 * @example
 * var features = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [26, 37]
 *       }
 *     },
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [36, 53]
 *       }
 *     }
 *   ]
 * };
 * turf.featureEach(features, function (currentFeature, currentIndex) {
 *   //=currentFeature
 *   //=currentIndex
 * });
 */
function featureEach$1(layer, callback) {
    if (layer.type === 'Feature') {
        callback(layer, 0);
    } else if (layer.type === 'FeatureCollection') {
        for (var i = 0; i < layer.features.length; i++) {
            callback(layer.features[i], i);
        }
    }
}

/**
 * Callback for featureReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @private
 * @callback featureReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Feature<any>} currentFeature The current Feature being processed.
 * @param {number} currentIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 */

/**
 * Reduce features in any GeoJSON object, similar to Array.reduce().
 *
 * @name featureReduce
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentFeature, currentIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     {
 *       "type": "Feature",
 *       "properties": {"foo": "bar"},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [26, 37]
 *       }
 *     },
 *     {
 *       "type": "Feature",
 *       "properties": {"hello": "world"},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [36, 53]
 *       }
 *     }
 *   ]
 * };
 * turf.featureReduce(features, function (previousValue, currentFeature, currentIndex) {
 *   //=previousValue
 *   //=currentFeature
 *   //=currentIndex
 *   return currentFeature
 * });
 */
function featureReduce(layer, callback, initialValue) {
    var previousValue = initialValue;
    featureEach$1(layer, function (currentFeature, currentIndex) {
        if (currentIndex === 0 && initialValue === undefined) {
            previousValue = currentFeature;
        } else {
            previousValue = callback(previousValue, currentFeature, currentIndex);
        }
    });
    return previousValue;
}

/**
 * Get all coordinates from any GeoJSON object.
 *
 * @name coordAll
 * @param {Object} layer any GeoJSON object
 * @returns {Array<Array<number>>} coordinate position array
 * @example
 * var features = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [26, 37]
 *       }
 *     },
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [36, 53]
 *       }
 *     }
 *   ]
 * };
 * var coords = turf.coordAll(features);
 * //=coords
 */
function coordAll(layer) {
    var coords = [];
    coordEach(layer, function (coord) {
        coords.push(coord);
    });
    return coords;
}

/**
 * Iterate over each geometry in any GeoJSON object, similar to Array.forEach()
 *
 * @name geomEach
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (currentGeometry, currentIndex)
 * @example
 * var features = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [26, 37]
 *       }
 *     },
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [36, 53]
 *       }
 *     }
 *   ]
 * };
 * turf.geomEach(features, function (currentGeometry, currentIndex) {
 *   //=currentGeometry
 *   //=currentIndex
 * });
 */
function geomEach(layer, callback) {
    var i, j, g, geometry, stopG,
        geometryMaybeCollection,
        isGeometryCollection,
        currentIndex = 0,
        isFeatureCollection = layer.type === 'FeatureCollection',
        isFeature = layer.type === 'Feature',
        stop = isFeatureCollection ? layer.features.length : 1;

  // This logic may look a little weird. The reason why it is that way
  // is because it's trying to be fast. GeoJSON supports multiple kinds
  // of objects at its root: FeatureCollection, Features, Geometries.
  // This function has the responsibility of handling all of them, and that
  // means that some of the `for` loops you see below actually just don't apply
  // to certain inputs. For instance, if you give this just a
  // Point geometry, then both loops are short-circuited and all we do
  // is gradually rename the input until it's called 'geometry'.
  //
  // This also aims to allocate as few resources as possible: just a
  // few numbers and booleans, rather than any temporary arrays as would
  // be required with the normalization approach.
    for (i = 0; i < stop; i++) {

        geometryMaybeCollection = (isFeatureCollection ? layer.features[i].geometry :
        (isFeature ? layer.geometry : layer));
        isGeometryCollection = geometryMaybeCollection.type === 'GeometryCollection';
        stopG = isGeometryCollection ? geometryMaybeCollection.geometries.length : 1;

        for (g = 0; g < stopG; g++) {
            geometry = isGeometryCollection ?
            geometryMaybeCollection.geometries[g] : geometryMaybeCollection;

            if (geometry.type === 'Point' ||
                geometry.type === 'LineString' ||
                geometry.type === 'MultiPoint' ||
                geometry.type === 'Polygon' ||
                geometry.type === 'MultiLineString' ||
                geometry.type === 'MultiPolygon') {
                callback(geometry, currentIndex);
                currentIndex++;
            } else if (geometry.type === 'GeometryCollection') {
                for (j = 0; j < geometry.geometries.length; j++) {
                    callback(geometry.geometries[j], currentIndex);
                    currentIndex++;
                }
            } else {
                throw new Error('Unknown Geometry Type');
            }
        }
    }
}

/**
 * Callback for geomReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @private
 * @callback geomReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {*} currentGeometry The current Feature being processed.
 * @param {number} currentIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 */

/**
 * Reduce geometry in any GeoJSON object, similar to Array.reduce().
 *
 * @name geomReduce
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentGeometry, currentIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     {
 *       "type": "Feature",
 *       "properties": {"foo": "bar"},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [26, 37]
 *       }
 *     },
 *     {
 *       "type": "Feature",
 *       "properties": {"hello": "world"},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [36, 53]
 *       }
 *     }
 *   ]
 * };
 * turf.geomReduce(features, function (previousValue, currentGeometry, currentIndex) {
 *   //=previousValue
 *   //=currentGeometry
 *   //=currentIndex
 *   return currentGeometry
 * });
 */
function geomReduce(layer, callback, initialValue) {
    var previousValue = initialValue;
    geomEach(layer, function (currentGeometry, currentIndex) {
        if (currentIndex === 0 && initialValue === undefined) {
            previousValue = currentGeometry;
        } else {
            previousValue = callback(previousValue, currentGeometry, currentIndex);
        }
    });
    return previousValue;
}

var index$4 = {
    coordEach: coordEach,
    coordReduce: coordReduce,
    propEach: propEach,
    propReduce: propReduce,
    featureEach: featureEach$1,
    featureReduce: featureReduce,
    coordAll: coordAll,
    geomEach: geomEach,
    geomReduce: geomReduce
};

var getCoords = index$2.getCoords;
var featureEach = index$4.featureEach;

/**
 * Takes a {@link Point} grid and returns a correspondent matrix {Array<Array<number>>}
 * of the 'property' values
 *
 * @name gridToMatrix
 * @param {FeatureCollection<Point>} grid of points
 * @param {string} [property='elevation'] the property name in `points` from which z-values will be pulled
 * @param {boolean} [flip=false] returns the matrix upside-down
 * @returns {Array<Array<number>>} matrix of property values
 * @example
 *   var pointGrid = require('@turf/point-grid');
 *   var extent = [-70.823364, -33.553984, -70.473175, -33.302986];
 *   var cellSize = 3;
 *   var grid = pointGrid(extent, cellSize);
 *   // add a random property to each point between 0 and 60
 *   for (var i = 0; i < grid.features.length; i++) {
 *     grid.features[i].properties.elevation = (Math.random() * 60);
 *   }
 *   gridToMatrix(grid);
 *   //= [
 *     [ 1, 13, 10,  9, 10, 13, 18],
 *     [34,  8,  5,  4,  5,  8, 13],
 *     [10,  5,  2,  1,  2,  5,  4],
 *     [ 0,  4, 56, 19,  1,  4,  9],
 *     [10,  5,  2,  1,  2,  5, 10],
 *     [57,  8,  5,  4,  5,  0, 57],
 *     [ 3, 13, 10,  9,  5, 13, 18],
 *     [18, 13, 10,  9, 78, 13, 18]
 *   ]
 */
var index = function (grid, property, flip) {
    // validation
    index$2.collectionOf(grid, 'Point', 'input must contain Points');
    property = property || 'elevation';

    var pointsMatrix = sortPointsByLatLng(grid, flip);

    var matrix = [];

    // create property matrix from sorted points
    // looping order matters here
    for (var r = 0; r < pointsMatrix.length; r++) {
        var pointRow = pointsMatrix[r];
        var row = [];
        for (var c = 0; c < pointRow.length; c++) {
            var point = pointRow[c];
            // property exist
            if (point.properties[property]) {
                row.push(point.properties[property]);
            } else {
                row.push(0);
            }
        }
        matrix.push(row);
    }

    return matrix;
};

/**
 * Sorts points by latitude and longitude, creating a 2-dimensional array of points
 *
 * @private
 * @param {FeatureCollection<Point>} points GeoJSON Point features
 * @param {boolean} [flip=false] returns the matrix upside-down
 * @returns {Array<Array<Point>>} points by latitude and longitude
 */
function sortPointsByLatLng(points, flip) {
    var pointsByLatitude = {};

    // divide points by rows with the same latitude
    featureEach(points, function (point) {
        var lat = getCoords(point)[1];
        if (!pointsByLatitude[lat]) { pointsByLatitude[lat] = []; }
        pointsByLatitude[lat].push(point);
    });

    // sort points (with the same latitude) by longitude
    var orderedRowsByLatitude = Object.keys(pointsByLatitude).map(function (lat) {
        var row = pointsByLatitude[lat];
        var rowOrderedByLongitude = row.sort(function (a, b) {
            return getCoords(a)[0] - getCoords(b)[0];
        });
        return rowOrderedByLongitude;
    });

    // sort rows (of points with the same latitude) by latitude
    var pointMatrix = orderedRowsByLatitude.sort(function (a, b) {
        if (flip) {
            return getCoords(a[0])[1] - getCoords(b[0])[1];
        } else {
            return getCoords(b[0])[1] - getCoords(a[0])[1];
        }
    });
    return pointMatrix;
}

return index;

})));
