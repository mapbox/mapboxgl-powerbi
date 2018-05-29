module powerbi.extensibility.visual {
    declare var turf : any;
    export module mapboxUtils {
        export interface Limits {
            min: number;
            max: number;
            values: number[];
        }

        export function zoomToData(map, bounds, autoZoomPinned) {
            
            if (bounds && !autoZoomPinned) {
                map.fitBounds(bounds, {
                    padding: 20,
                    maxZoom: 15,
                });
            }
            
        }

        export function shouldUseGradient(colorColumn, colorLimits: { min: any; max: any; values: any; }) {
            if (colorColumn != null && colorLimits && colorLimits.min != null && colorLimits.min.toString() !== colorLimits.min) {
                return true
            }

            return false
        }

        export function getClassCount(limits: { min: number; max: number; values: number[]; }) {
            const MAX_BOUND_COUNT = 6;
            // For example if you want 5 classes, you have to enter 6 bounds
            // (1 bound is the minimum value, 1 bound is the maximum value,
            // the rest are class separators)
            const classCount = Math.min(limits.values.length, MAX_BOUND_COUNT) - 1;
            return classCount;
        }

        export function getNaturalBreaks(limits: { min: any; max: any; values: any[]; }, classCount: number) {
            const stops: any[] = chroma.limits(limits.values, 'q', classCount);
            return stops;
        }

        export function getRoleMap(metadata) {
            let ret = {}
            metadata.columns.map(column => {
                Object.keys(column.roles).map(role => {
                    ret[role] = column
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

        function getCenter(feature) {
            if (feature && feature.geometry)
            {
                if (feature.geometry.type == 'Point') {
                    return feature.geometry.coordinates
                }

                const bbox = turf.bbox(feature)

                const pointCollection = turf.helpers.featureCollection([
                    turf.helpers.point( [bbox[0], bbox[1]]),
                    turf.helpers.point( [bbox[2], bbox[3]]),
                ]);

                const center = turf.center(pointCollection);
                return center.geometry.coordinates
            }
        }

        export function createClickHandler(mapVisual: MapboxMap) {
            var onClick : Function = function(e) {
                const map = mapVisual.getMap()

                // map.queryRenderedFeatures fails
                // when option.layers contains an id which is not on the map
                const layers = mapVisual.getExistingLayers().map(layer => layer.getId())

                const radius = 5
                let minpoint = new Array(e.point['x'] - radius, e.point['y'] - radius)
                let maxpoint = new Array(e.point['x'] + radius, e.point['y'] + radius)
                let features : any = map.queryRenderedFeatures([minpoint, maxpoint], {
                    layers
                });

                if (features
                    && features.length
                    && features[0]
                    && features[0].geometry
                    && features[0].geometry.coordinates
                ) {
                    mapVisual.hideTooltip()
                    map.easeTo({
                        center: getCenter(features[0]),
                        zoom: map.getZoom() + 1,
                        duration: 1000
                    });
                }
            }

            return onClick
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

        export function getLimits(data, myproperty) : Limits {

            let min = null;
            let max = null;
            let values = [];

            if (data && data.length > 0 && myproperty != '') {
                if (data[0]['type']) {
                    // data are geojson
                    turf.meta.propEach(turf.helpers.featureCollection(data), function(currentProperties, featureIndex) {
                        if (currentProperties[myproperty]) {
                            const value = currentProperties[myproperty];
                            if (!min || value < min) { min = value }
                            if (!max || value > max) { max = value }
                            pushIfNotExist(values, value)
                        }
                    })
                }
                else {
                    // data are non-geojson objects for a choropleth
                    data.forEach(f => {
                        if (f[myproperty] !== undefined && f[myproperty] !== null) {
                            const value = f[myproperty];
                            if (!min || value < min) { min = value }
                            if (!max || value > max) { max = value }
                            pushIfNotExist(values, value)
                        }
                    })
                }
            }

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

        export function getCategoricalObjectValue<T>(category: DataViewCategoryColumn, index: number, objectName: string, propertyName: string, defaultValue: T): T {
            let categoryObjects = category.objects;

            if (categoryObjects) {
                let categoryObject: DataViewObject = categoryObjects[index];
                if (categoryObject) {
                    let object = categoryObject[objectName];
                    if (object) {
                        let property: T = object[propertyName];
                        if (property !== undefined) {
                            return property;
                        }
                    }
                }
            }
            return defaultValue;
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
    }
}

