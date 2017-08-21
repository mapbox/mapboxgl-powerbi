These scripts started life (a long time ago) as simple code fragments intended to help people who had
little experience of geodesy, limited programming experience, or both.

The intention was to have clear, simple illustrative code samples which people could adapt and re-use in their own projects
(whether those be in JavaScript, Java, Excel VBA, Fortran, or anything else).

They have grown since then into considerable libraries of inter-related functions, and managing that
process has not always been straightforward.

My background (showing my age) was in C & Pascal (& Unix V7). I had no difficulty in transitioning from class-based
concepts to JavaScript’s prototype-based approach (rather the converse), but have to bear in mind 
people who might want to adapt these routines in class-based languages.

Spherical earth model

| latlon-spherical.js                               | Latitude/longitude functions on a spherical earth model |
|---------------------------------------------------|---------------------------------------------------------|
| *Constructor*                                             |  |
| `new LatLon(lat, lon[, radius])`                          | Create new latitude/longitude point on a spherical earth model of given radius (default 6371km) |
| *Methods*                                                 |  |
| `latlon.distanceTo(point)`                                | Distance to point (using Haversine) |
| `latlon.bearingTo(point)`                                 | (Initial) bearing to point  |
| `latlon.finalBearingTo(point)`                            | Final bearing to point  |
| `latlon.midpintTo(point)`                                 | Midpoint to point  |
| `latlon.destinationPoint(bearing, distance)`              | Destination point travelling distance on bearing  |
| `LatLon.intersection(point1, bearing1, point2, bearing2)` | Intersection point of two paths defined by point and bearing |
| `latlon.rhumbDistanceTo(point)`                           | Distance to point along rhumb line |
| `latlon.rhumbBearingTo(point)`                            | (Initial) bearing to point along rhumb line |
| `latlon.rhumbDestinationPoint(bearing, distance)`         | Destination point travelling distance on bearing |
| `latlon.toString([format[, decimals]])`                   | String representation of point, in d/dm/dms format to given decimal places |

Ellipsoidal earth model

| latlon-ellipsoid.js                               | Latitude/longitude functions on an ellipsoidal earth model |
|---------------------------------------------------|---------------------------------------------------------|
| *Constructor*                                     |  |
| `new LatLon(lat, lon[, datum])`                   | Create new latitude/longitude point on an ellipsoidal earth model using given datum (default WGS84) |
| *Properties*                                      |  |
| `datum`                                           | Associated ellipsoid and Helmert transforms parameters from WGS84 for various datums |
| `ellipsoid`                                       | Ellipsoid parameters major axis (a), minor axis (b), and flattening (f) for various ellipsoids |
| *Methods*                                         |  |
| `latlon.distanceTo(point)`                        | Distance to point (using Vincenty calculation) |
| `latlon.bearingTo(point)`                         | (Initial) bearing to point (using Vincenty calculation) |
| `latlon.finalBearingTo(point)`                    | Final bearing to point (using Vincenty calculation) |
| `latlon.destinationPoint(bearing, distance)`      | Destination point travelling distance on bearing  |
| `latlon.convertDatum(datum)`                      | Convert point into new datum |
| `latlon.toCartesian()`                            | Convert point cartesian Vector3d point |
| `vector3d.toLatLon(datum)`                        | Convert Vector3d point to latitude longitude in given datum |
| `latlon.toString([format[, decimals]])`           | String representation of point, in d/dm/dms format to given decimal places |

Using vector calculations (on spherical earth model)

| latlon-vector.js                                  | Latitude/longitude functions using vector calculations |
|---------------------------------------------------|---------------------------------------------------------|
| *Constructor*                                     |  |
| `new LatLon(lat, lon[, radius])`                  | Create new latitude/longitude point on a spherical earth model of given radius (default 6371km) |
| *Methods*                                         |  |
| `latlon.toVector()`                               | Convert latitude/longitude point to vector |
| `vector3d.toLatLon()`                             | Convert vector to latitude/longitude point |
| `latlon.creatCircle(bearing)`                     | Return vector representing great circle obtained by heading on given bearing from latlon point |
| `latlon.distanceTo(point)`                        | Distance to point (using Haversine) |
| `latlon.bearingTo(point)`                         | (Initial) bearing to point  |
| `latlon.midpintTo(point)`                         | Midpoint to point  |
| `latlon.destinationPoint(bearing, distance)`      | Destination point travelling distance on bearing  |
| `latlon.intersection(path1start, path1brngEnd, path2start, path2brngEnd)` | Intersection of two paths defined by start+bearing or start+end  |
| `latlon.crossTrackDistanceTo(point)`              | Distance to great circle defined by start-point and end-point/bearing |
| `latlon.toString([format[, decimals]])`           | String representation of point, in d/dm/dms format to given decimal places |

UTM coordintates / MGRS grid references

| utm.js                                            | Universal Transverse Mercator / Latitude-Longitude conversions |
|---------------------------------------------------|---------------------------------------------------------|
| *Constructor*                                     |  |
| `new Utm(zone, hemisphere, easting, northing[, datum[, convergence, scale]])` | Create new UTM coordinate on given datum (default WGA84) |
| `latlon.toUtm()`                                  | Convert latitude/longitude point to UTM coordinate |
| `utm.toLatLon()`                                  | Convert UTM coordinate to latitude/longitude point |
| `Utm.parse([utmCoord])`                           | Parse string representation of UTM coordinate |
| `utm.toString([digits])`                          | String representation of UTM coordinate |

| mgrs.js                                           | MGRS/NATO grid references |
|---------------------------------------------------|---------------------------------------------------------|
| *Constructor*                                     |  |
| `new Mgrs(zone, band, e100k, n100k, easting, northing[, datum])` | Create new MGRS grid reference on given datum (default WGA84) |
| `utm.toMgrs()`                                    | Convert UTM coordinate to MGRS grid reference |
| `mgrs.toUtm()`                                    | Convert MGRS grid reference to UTM coordinate |
| `Mgrs.parse(mgrsGridRef)`                         | Parse string representation of MGRS grid reference |
| `mgrs.toString([digits])`                         | String representation of MGRS grid reference |

UK Ordnance Survey grid references

| osgridref.js                                      | Ordnance Survey grid references |
|---------------------------------------------------|---------------------------------------------------------|
| *Constructor*                                     |  |
| `new Mgrs(easting, northing)`                     | Create new OS grid reference |
| `latlon.toOsGridRef()`                            | Convert UTM coordinate to MGRS grid reference |
| `osGridRef.toLatLon()`                            | Convert OS grid reference to latitude/longitude |
| `OsGridRef.parse(gridref)`                        | Parse string representation of OS grid reference |
| `osGridRef.toString([digits])`                    | String representation of OS grid reference |

