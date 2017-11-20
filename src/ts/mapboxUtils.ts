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
                                layers: ['data']
                            });
                            map.getCanvas().style.cursor = 'pointer';
                            let feat = features[0];
                            let tooltip = feat.properties.tooltip;

                            popup.setLngLat(map.unproject(e.point))
                                .setHTML("<div><h3>Tooltip</h3>"+
                                    "<li>Value: " + tooltip + "<li></div>")
                                .addTo(map);
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
                            layers: ['data']
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
                        
        export function decorateLayer(layer, columns, maxSize) {
            switch (layer.type) {
                case 'circle': {
                    layer.paint = {};

                    const color = columns.find( column => column.roles.category);
                    if (color) {
                        layer.paint["circle-color"] = {
                            "property": "color",
                            "type": "identity"
                        }
                    }
                    const size = columns.find( column => column.roles.size);
                    if (size && maxSize) {
                        layer.paint["circle-radius"] = {
                            "property": "size",
                            stops: [
                              [1, 2],
                              [maxSize, 20]
                            ]
                        }
                    }
                    break;
                }
                case 'cluster': {
                    layer.type = 'circle';
                    layer.filter = ["has", "point_count"];
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

