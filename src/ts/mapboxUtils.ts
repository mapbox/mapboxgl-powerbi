module powerbi.extensibility.visual {
    declare var turf : any;
    export module mapboxUtils {
        export function zoomToData(map, features) {
            let bounds : any = features.bounds;
            if (!bounds && features.rawData) {
                bounds = turf.bbox(turf.helpers.featureCollection(features.rawData));
            }

            const isPinned = false /* mapboxMapNotYetGiventoThisMethod.isPinned() */
            if (bounds && !isPinned) {
                map.fitBounds(bounds, {
                    padding: 10,
                    maxZoom: 15,
                });
            }
        }

        export function getRoleMap(metadata) {
            let ret = {}
            metadata.columns.map(column => {
                Object.keys(column.roles).map(role => {
                    ret[role] = column.displayName
                });
            });
            return ret;
        }

        export function positionInArray(array, element: any) {
            return array.findIndex( value => {
                return value === element
            })
        }

        export function pushIfNotExist(array: any[], element: any) {
            if (positionInArray(array, element) === -1) {
                array.push(element)
            }
        }

        export function addClick(map: mapboxgl.Map) {
            // map.off('click');
            if (map.listens('click')) { return; }

            var onClick : Function = debounce(function(e) {
                let minpoint = new Array(e.point['x'] - 5, e.point['y'] - 5)
                let maxpoint = new Array(e.point['x'] + 5, e.point['y'] + 5)
                let features : any = map.queryRenderedFeatures([minpoint, maxpoint], {
                    layers: ['cluster', 'circle', 'uncluster']
                });

                if (!features.length) {return}

                map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: map.getZoom() + 1,
                    duration: 1000
                });
            }, 22, false);

            map.on('click', onClick);
        };

        export function decorateLayer(layer) {
            switch (layer.type) {
                case 'circle': {
                    layer.paint = {};
                    break;
                }
                case 'cluster': {
                    layer.type = 'circle';
                    break;
                }
                case 'heatmap': {
                    layer.paint = {};
                    break;
                }
            }
            return layer;
        }

        export function getLimits(data, myproperty) {

            let min = null;
            let max = null;
            let values = [];
            turf.meta.propEach(turf.helpers.featureCollection(data), function(currentProperties, featureIndex) {
                if (currentProperties[myproperty]) {
                    const value = currentProperties[myproperty];
                    if (!min || value < min) { min = value }
                    if (!max || value > max) { max = value }
                    pushIfNotExist(values, value)
                }
            })
            // Min and max must not be equal becuse of the interpolation.
            // let's make sure with the substraction
            if (min == max) {
                min = min - 1
            }
            return {
                min,
                max,
                values
            }
        }

        "use strict";
        export function logExceptions(): MethodDecorator {
            return function (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<Function>)
            : TypedPropertyDescriptor<Function> {
                return {
                    value: function () {
                        try {
                            return descriptor.value.apply(this, arguments);
                        } catch (e) {
                            console.error(e);
                            throw e;
                        }
                    }
                }
            }
        }

        const debounce = (func, wait, immediate) => {
            let timeout;
            let returnFunction : any = function() {
                const context = this, args = arguments;
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                }, wait);
                if (callNow) func.apply(context, args);
            };

            return returnFunction
        };

    }
}

