function decorateLayer(layer, columns, maxSize) {
    if (layer.type == 'circle') {
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
    }
    return layer;
}

function getLegendColumn(columns) {
    const category = columns.find( column => {
        return column.roles.category;
    });
    const size = columns.find( column => {
        return column.roles.size;
    });
    return category || size;
}


module powerbi.extensibility.visual {
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

    export class MapboxMap implements IVisual {
        private map: mapboxgl.Map;
        private mapOptions: mapboxgl.MapboxOptions;
        private mapDiv: HTMLDivElement;
        private mapOptionsDiv: HTMLElement;
        private mapLegend: HTMLElement;
        private dataView: DataView;
        private popup: mapboxgl.Popup;
        private host: IVisualHost;
        private categoryName: string = "";
        private measureName: string = "";
        private firstRun: boolean = true;
        private mapboxData: MapboxData;
        private settings: MapboxSettings;
        private firstLayer: mapboxgl.Layer;
        private secondLayer: mapboxgl.Layer;

        // private get settings(): MapboxSettings {
        // return this.mapboxData && this.mapboxData.settings;
        // }

         /**
         * This function returns the values to be displayed in the property pane for each object.
         * Usually it is a bind pass of what the property pane gave you, but sometimes you may want to do
         * validation and return other values/defaults
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            let instances: VisualObjectInstanceEnumeration = null;
            switch (options.objectName) {
                   default:
                        return MapboxSettings.enumerateObjectInstances(
                            this.settings || MapboxSettings.getDefault(),
                            options);
                }
        }

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            //Map initialization    
            this.mapDiv = document.createElement('div');
            this.mapDiv.className = 'map';
            this.mapDiv.style.position = "absolute";
            this.mapDiv.style.top = "0";
            this.mapDiv.style.bottom ="0";
            this.mapDiv.style.left ="0";
            this.mapDiv.style.width = "100%";
            this.mapDiv.style.overflow = 'visible';
            options.element.appendChild(this.mapDiv);
            
            this.mapLegend = document.createElement('legend');
            this.mapLegend.className = 'legend';
            this.mapLegend.id = 'legend';
            this.mapDiv.appendChild(this.mapLegend);

            this.mapOptions = {
                container: this.mapDiv,
                center: [-74.50, 40],
                zoom: 0
            }

        }

        public static parseSettings(dataView: DataView): MapboxSettings {
            let settings: MapboxSettings = MapboxSettings.parse<MapboxSettings>(dataView);
            return settings;
        }

        public static debounce(func, wait, immediate) {
            var timeout;
            var returnFunction : any = function() {
                var context = this, args = arguments;
                var later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };

            return returnFunction
        };

        public static create_fc(features : Array<GeoJSON.Feature<any>>) {
            var empty_fc : any = {"type": "FeatureCollection", "features": []};
            return empty_fc.features.push(features);
        }

        @logExceptions()
        public update(options: VisualUpdateOptions) {
            var _this = this
            //Only run this step if there are lat/long values to parse
            if (options.dataViews[0].metadata.columns.length < 2) { 
                _this.firstRun = false;
                return 
            };
            this.dataView = options.dataViews[0];
            this.mapboxData  = mapboxConverter.convert(this.dataView, this.host);
            this.settings = MapboxMap.parseSettings(this.dataView);


            if (!this.settings.api.accessToken) {
                return;
            }
            mapboxgl.accessToken = this.settings.api.accessToken;

            this.popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false
            });

            const mapOptions = {
                container: this.mapDiv,
                center: [-74.50, 40],
                zoom: 0
            }

            //If the map container doesnt exist yet, create it
            if (this.map === undefined ) {
                this.map = new mapboxgl.Map(mapOptions);
                this.map.addControl(new mapboxgl.NavigationControl());
            }
            const layerType = this.settings.api.layerType;

            this.firstLayer = decorateLayer({
                id: 'first',
                source: 'data1',
                type: layerType
            }, this.dataView.table.columns, this.mapboxData.maxSize)

            this.secondLayer = decorateLayer({
                id: 'second',
                source: 'data2',
                type: layerType
            }, this.dataView.table.columns, this.mapboxData.maxSize)


            this.map.setStyle(this.settings.api.style);
            this.map.on('style.load', runload);


            function onUpdate() {
                if (_this.map.getSource('data1')) {
                    let source1 : any = _this.map.getSource('data1');
                    let source2 : any = _this.map.getSource('data2');
                    source1.setData( turf.featureCollection(_this.mapboxData.features.slice(0,Math.floor(_this.mapboxData.features.length/2))) );
                    source2.setData( turf.featureCollection(_this.mapboxData.features.slice(Math.floor(_this.mapboxData.features.length/2), _this.mapboxData.features.length)) );
                    _this.map.removeLayer('first');
                    _this.map.removeLayer('second');
                    _this.map.addLayer(_this.firstLayer);
                    _this.map.addLayer(_this.secondLayer);
                }
                else {
                    _this.map.addSource('data1', {
                        type: "geojson", 
                        data: turf.featureCollection(_this.mapboxData.features.slice(0,Math.floor(_this.mapboxData.features.length/2))),
                        buffer: 10
                    });

                    _this.map.addSource('data2', {
                        type: "geojson", 
                        data: turf.featureCollection(_this.mapboxData.features.slice(Math.floor(_this.mapboxData.features.length/2), _this.mapboxData.features.length)),
                        buffer: 10
                    });

                    _this.map.addLayer({
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

                    _this.map.addLayer(_this.firstLayer, 'waterway-label');
                    _this.map.addLayer(_this.secondLayer, 'waterway-label');
            }
        }

            function addPopup() {
            	// Don't add the popup if it already exists
                if (_this.map.listens('mousemove')) { return }

                var onMouseMove : Function = MapboxMap.debounce(function(e) {
                    let minpoint = new Array(e.point['x'] - 5, e.point['y'] - 5)
                    let maxpoint = new Array(e.point['x'] + 5, e.point['y'] + 5)
                    try {
                        let features : any = _this.map.queryRenderedFeatures([minpoint, maxpoint], {
                            layers: ['first', 'second']
                        });
                        _this.map.getCanvas().style.cursor = 'pointer';
                        let feat = features[0];
                        let tooltip = feat.properties.tooltip;

                        _this.popup.setLngLat(_this.map.unproject(e.point))
                            .setHTML("<div><h3>Tooltip</h3>"+
                                "<li>Value: " + tooltip + "<li></div>")
                            .addTo(_this.map);
                    } catch (err) {
                        _this.map.getCanvas().style.cursor = '';
                        _this.popup.remove();
                        return
                    }
                }, 16, false);
               
            	_this.map.on('mousemove', onMouseMove);
	        }

            function addClick() {
                _this.map.off('click');

                var onClick : Function = MapboxMap.debounce(function(e) {
                    let minpoint = new Array(e.point['x'] - 5, e.point['y'] - 5)
                    let maxpoint = new Array(e.point['x'] + 5, e.point['y'] + 5)
                    let features : any = _this.map.queryRenderedFeatures([minpoint, maxpoint], {
                        layers: ['first', 'second']
                    });

                    if (!features.length) {return}

                    _this.map.easeTo({
                        center: features[0].geometry.coordinates,
                        zoom: 15,
                        duration: 500
                    });
                }, 16, true);
               
                _this.map.on('click', onClick);
            };
            

        function runload() {
            onUpdate();
            addPopup();
            addClick();

            let bounds : any = turf.bbox(turf.featureCollection(_this.mapboxData.features));
            bounds = bounds.map( bound => {
                if (bound < -90) {
                    return -90;
                }
                if (bound > 90) {
                    return 90;
                }
                return bound;
            });

            _this.map.easeTo( {
                duration: 500,
                pitch: 0,
                bearing: 0
            });
            _this.map.fitBounds(bounds, {
                padding: 25
            });
            _this.firstRun = false;
        }

        // If running update for the first time, wait for the load event
        if (_this.firstRun) {
            _this.map.once('load', runload);
        }
        else {
            //If refreshing the map, update the map if it's already fully rendered
            if (_this.map.loaded) {
                // runload();
            }
            else {
                //If refreshing the map and existing data is still loading, update when finished loading
                _this.map.on('sourcedata', runload);
            }  
        }
        
    }

        @logExceptions()
        public destroy(): void {
            this.map.remove();
        }
    }
}
