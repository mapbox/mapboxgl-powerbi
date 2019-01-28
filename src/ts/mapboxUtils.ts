module powerbi.extensibility.visual {
    declare var turf: any;
    export module mapboxUtils {
        export interface Limits {
            min: number;
            max: number;
            values: number[];
        }

        export function zoomToData(map, bounds) {
            if (bounds) {
                map.fitBounds(bounds, {
                    padding: 20,
                    maxZoom: 15,
                });
            }
        }

        export function shouldUseGradient(colorColumn) {
            return colorColumn && colorColumn.aggregates != null;
        }

        export function debounce(func, wait, immediate) {
            let timeout;
            return function () {
                let context = this, args = arguments;
                let later = function () {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                let callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        };


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
            const ret = {
                tooltips: {}
            }
            metadata.columns.map(column => {
                Object.keys(column.roles).map(role => {
                    if (role === "tooltips") {
                        ret.tooltips[column.displayName] = column;
                    } else {
                        ret[role] = column
                    }
                });
            });
            return ret;
        }

         export function positionInArray(array: any[], element: any) {
            let found = false
            for (let i = 0; i <= array.length; i++) {
                if (array[i] == element) {
                    found = true
                    break
                }
            }
            if (!found) {
                return -1
            }
         }

        export function pushIfNotExist(array: any[], element: any) {
            if (positionInArray(array, element) === -1) {
                array.push(element)
            }
        }

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

        export function getLimits(data, myproperty): Limits {

            let min = null;
            let max = null;
            let values = [];

            if (data && data.length >= 0 && myproperty != '') {
                if (data[0]['type']) {
                    // data are geojson
                    turf.meta.propEach(turf.helpers.featureCollection(data), function (currentProperties, featureIndex) {
                        if (currentProperties[myproperty] || currentProperties[myproperty] === 0) {
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

            // Min and max must not be equal because of the interpolation.
            // let's make sure with the substraction if it is a number
            if (min && min.toString() !== min && min == max) {
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

