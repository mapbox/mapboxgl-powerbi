module powerbi.extensibility.visual {
    declare var turf : any;
    export module mapboxUtils {
        const NUMBER_OF_COLORVALUES = 12;

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

        export function getColorFromIndex(index: number) {
            return index % NUMBER_OF_COLORVALUES
        }

        export function shouldUseGradient(category, colorLimits: { min: any; max: any; values: any; }) {
            if (category != null && category.isMeasure) {
                return true
            }

            if (colorLimits == null || colorLimits.values == null || colorLimits.values.length == null) {
                return false
            }

            if (colorLimits.values.length >= NUMBER_OF_COLORVALUES) {
                return true
            }

            return false
        }

        export function addPopup(map: mapboxgl.Map, popup: mapboxgl.Popup ) {
            // Don't add the popup if it already exists
                    if (map.listens('mousemove')) { return }

                    var onMouseMove : Function = debounce(function(e) {
                        let minpoint = new Array(e.point['x'] - 5, e.point['y'] - 5)
                        let maxpoint = new Array(e.point['x'] + 5, e.point['y'] + 5)

                        try {
                            let features : any = map.queryRenderedFeatures([minpoint, maxpoint], {
                                layers: ['cluster', 'circle', 'uncluster']
                            });
                            map.getCanvas().style.cursor = 'pointer';
                            if ( (features[0].properties.tooltip) || (Object.keys(features[0].properties.tooltip).length == 0)) {
                                let tooltip = "<div>"
                                let tooltips = features.map( feature => {
                                    let tooltipItem = "";
                                    try {
                                        const tooltipObj = JSON.parse(feature.properties.tooltip);
                                        if (tooltipObj.title) {
                                            tooltipItem += `<h3>${tooltipObj.title}</h3>`
                                        }
                                        tooltipItem += `<li><b>Longitude:</b> ` + Math.round(feature.geometry.coordinates[0]*100000)/10000 + `</li>`
                                        tooltipItem += `<li><b>Latitude:</b> ` + Math.round(feature.geometry.coordinates[1]*10000)/100000 + `</li>`
                                        tooltipItem += Object.keys(tooltipObj.content).map( key => {
                                            return `<li><b>${key}:</b> ${tooltipObj.content[key]}</li>`
                                        }).join('');
                                    } catch (_err) {
                                        // Pass, if we couldn't parse the JSON just skip.
                                    } finally {
                                        return tooltipItem;
                                    }
                                })
                                tooltip += tooltips.join('<hr />')
                                tooltip += "</div>"
                                popup.setLngLat(map.unproject(e.point))
                                    .setHTML(tooltip)
                                    .addTo(map);
                            }
                        } catch (err) {
                            map.getCanvas().style.cursor = '';
                            popup.remove();
                            return
                        }
                    }, 16, false);

                    map.on('mousemove', onMouseMove);
                }

                export function addClick(map: mapboxgl.Map) {
                    // map.off('click');
                    if (map.listens('click')) { return; }

                    var onClick : Function = debounce(function(e) {
                        let minpoint = new Array(e.point['x'] - 5, e.point['y'] - 5)
                        let maxpoint = new Array(e.point['x'] + 5, e.point['y'] + 5)
                        let features : any = map.queryRenderedFeatures([minpoint, maxpoint], {
                            layers: ['cluster']
                        });

                        if (!features.length) {return}

                        map.easeTo({
                            center: features[0].geometry.coordinates,
                            zoom: 10,
                            duration: 1000
                        });
                    }, 16, false);

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

