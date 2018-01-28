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

        export function addPopup(map: mapboxgl.Map, popup: mapboxgl.Popup, settings ) {
            // Don't add the popup if it already exists
                if (map.listens('mousemove')) { map.off('mousemove') }

                function jsUcfirst(string) {
                    return string.charAt(0).toUpperCase() + string.slice(1);
                }

                var onMouseMove : Function = debounce(function(e) {
                    let minpoint = new Array(e.point['x'] - 5, e.point['y'] - 5)
                    let maxpoint = new Array(e.point['x'] + 5, e.point['y'] + 5)

                    try {
                        let features : any = map.queryRenderedFeatures([minpoint, maxpoint], {
                            layers: ['cluster', 'circle', 'uncluster']
                        });
                        map.getCanvas().style.cursor = 'pointer';
                        if (features[0].properties.tooltip) {
                            let tooltip = "<div>"
                            //Add tooltips for up to 5 items under the mouse cursor (improves performance while zoomed out)
                            let tooltips = features.slice(0,5).map( feature => {
                                let tooltipItem = "";
                                try {
                                    const tooltipObj = JSON.parse(feature.properties.tooltip);
                                    tooltipItem += `<li><b>Longitude:</b> ` + Math.round(feature.geometry.coordinates[0]*100000)/10000 + `</li>`;
                                    tooltipItem += `<li><b>Latitude:</b> ` + Math.round(feature.geometry.coordinates[1]*10000)/100000 + `</li>`;
                                    if (tooltipObj.title) {
                                        let agg = jsUcfirst(settings.cluster.aggregation);
                                        let title = tooltipObj.title;
                                        tooltipItem += `<li><b>` + agg + ` of ` + title + `:</b> ` + tooltipObj.content[agg] + `</li>`;
                                    }
                                    else {
                                        tooltipItem += Object.keys(tooltipObj.content).map( key => {
                                            return `<li><b>${key}:</b> ${tooltipObj.content[key]}</li>`
                                        }).join('');
                                    }
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
                    }, 22, false);

                    map.on('mousemove', onMouseMove);
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

