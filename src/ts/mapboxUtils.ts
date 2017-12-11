module powerbi.extensibility.visual {
    export module mapboxUtils {
        export function addPopup(map: mapboxgl.Map, popup: mapboxgl.Popup ) {
            // Don't add the popup if it already exists
                    if (map.listens('mousemove')) { return }

                    var onMouseMove : Function = debounce(function(e) {
                        let minpoint = new Array(e.point['x'] - 5, e.point['y'] - 5)
                        let maxpoint = new Array(e.point['x'] + 5, e.point['y'] + 5)
                        try {
                            let features : any = map.queryRenderedFeatures([minpoint, maxpoint], {
                                layers: ['cluster', 'circle', 'heatmap']
                            });
                            map.getCanvas().style.cursor = 'pointer';
                            let feat = features[0];

                            let tooltip = "<div><h3>Tooltip</h3>"
                            feat.properties.tooltip.split(',').map( tooltipItem => {
                                tooltip += `<li>${tooltipItem}</li>`
                            })
                            tooltip += "</div>"
                            popup.setLngLat(map.unproject(e.point))
                                .setHTML(tooltip)
                                .addTo(map);
                        } catch (err) {
                            map.getCanvas().style.cursor = '';
                            popup.remove();
                            return
                        }
                    }, 300, false);
                   
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
                            zoom: 15,
                            duration: 500
                        });
                    }, 16, true);
                   
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
                    layer.filter = ["has", "point_count"];
                    break;
                }
                case 'heatmap': {
                    layer.paint = {};
                    break;
                }
            }
            return layer;
        }

        export function getLegendColumn(columns) {
            const category = columns.find( column => {
                return column.roles.category;
            });
            const size = columns.find( column => {
                return column.roles.size;
            });
            return category || size;
        }

        export function addBuildings(map) {
            map.addLayer({
                'id': '3d-buildings',
                'source': 'composite',
                'source-layer': 'building',
                'filter': ['==', 'extrude', 'true'],
                'type': 'fill-extrusion',
                'minzoom': 15,
                'paint': {
                    'fill-extrusion-color': '#aaa',
                    'fill-extrusion-height': {
                        'type': 'identity',
                        'property': 'height'
                    },
                    'fill-extrusion-base': {
                        'type': 'identity',
                        'property': 'min_height'
                    },
                    'fill-extrusion-opacity': .5
                }
            }, 'waterway-label');
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

