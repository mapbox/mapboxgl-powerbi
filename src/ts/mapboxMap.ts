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
        debugger;
        private map: mapboxgl.Map;
        private mapOptions: mapboxgl.MapboxOptions;
        private mapDiv: HTMLDivElement;
        private dataView: DataView;
        private popup: mapboxgl.Popup;
        private host: IVisualHost;
        private categoryName: string = "";
        private measureName: string = "";
        private firstRun: boolean = true;
        private MAPBOX_ACCESS_TOKEN: string = "pk.eyJ1IjoicnNiYXVtYW5uIiwiYSI6ImNqNmFibmgyYjExeDgycXJ5emltZmR4dWgifQ.a1eP4yuu6UsxhZ1wEWDQgA"

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            //Map initialization    
            this.mapDiv = document.createElement('div');
            this.mapDiv.className = 'map';
            this.mapDiv.style.position = "absolute"
            this.mapDiv.style.top = "0"
            this.mapDiv.style.bottom ="0"
            this.mapDiv.style.width = "100%";
            options.element.appendChild(this.mapDiv);

            this.mapOptions = {
                container: this.mapDiv,
                style: 'mapbox://styles/mapbox/dark-v9?optimize=true',
                center: [-74.50, 40],
                zoom: 0
            }

            mapboxgl.accessToken = this.MAPBOX_ACCESS_TOKEN;

            this.popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false
            });

            //If the map container doesnt exist yet, create it
            if (this.map === undefined ) {
                this.map = new mapboxgl.Map(this.mapOptions);
                this.map.addControl(new mapboxgl.NavigationControl());
                this.map.addControl(new mapboxgl.ScaleControl({
                    maxWidth: 80,
                    unit: 'imperial'
                }));
            }
        }

        @logExceptions()
        public static converter(dataView: DataView, host: IVisualHost) {

            const {columns, rows} = dataView.table;
            var domain : any = []

            const datas = rows.map(function (row, idx) {
                let data = row.reduce(function (d : any, v, i) {
                    const role = Object.keys(columns[i].roles)[0]
                    d[role] = v;
                    if (role == 'category') {
                        domain.push(v)
                    }
                    return d;
                }, {});
                return data;
            });

            let limits = chroma.limits(domain, 'q', 5);
            let scale = chroma.scale('YlGnBu').domain(limits).mode('lab')
            var features = [];

            datas.map(function (d) {

                let feat: GeoJSON.Feature<any> = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [d.longitude, d.latitude]
                    },
                    "properties": {
                        "color": scale(d.category).toString(),
                        "tooltip": d.tooltip
                    }
                }
                features.push(feat)
            });

            return features;
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


        @logExceptions()
        public update(options: VisualUpdateOptions) {

            //Only run this step if there are lat/long values to parse
            if (!options.dataViews || !options.dataViews[0]) return;

            var _this = this
            
            this.dataView = options.dataViews[0];
            var features = MapboxMap.converter(this.dataView, this.host);

            function onUpdate() {

                if (_this.map.getSource('data1')) {
                    let source1 : any = _this.map.getSource('data1');
                    let source2 : any = _this.map.getSource('data2');
                    source1.setData( turf.featureCollection(features.slice(0,Math.floor(features.length/2))) );
                    source2.setData( turf.featureCollection(features.slice(Math.floor(features.length/2),features.length)) );
                }
                else {
                    _this.map.addSource('data1', {
                        type: "geojson", 
                        data: turf.featureCollection(features.slice(0,Math.floor(features.length/2))),
                        buffer: 0, 
                        maxzoom: 12
                    });

                    _this.map.addSource('data2', {
                        type: "geojson", 
                        data: turf.featureCollection(features.slice(Math.floor(features.length/2),features.length)),
                        buffer: 0, 
                        maxzoom: 12
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

                    _this.map.addLayer({
                        id: "circle-1",
                        source: 'data1',
                        type: "circle",
                        paint: {
                            "circle-color": {
                                "property": "color",
                                "type": "identity"
                            },
                            "circle-radius": {
                                "stops": [
                                [0,0.1],[12,4],[20,16]]
                            },
                            "circle-stroke-width": {
                                "stops": [[0,0.1], [12,0.2], [22,1]]
                            }
                        }
                    }, 'waterway-label');

                    _this.map.addLayer({
                        id: "circle-2",
                        source: 'data2',
                        type: "circle",
                        paint: {
                            "circle-color": {
                                "property": "color",
                                "type": "identity"
                            },
                            "circle-radius": {
                                "stops": [
                                [0,0.1],[12,4],[20,16]]
                            },
                            "circle-stroke-width": {
                                "stops": [[0,0.1], [12,0.2], [22,1]]
                            }
                        }
                    }, 'waterway-label');
            }
        }

            function addPopup() {
                _this.map.off('mousemove');

                var onMouseMove : Function = MapboxMap.debounce(function(e) {
                    let minpoint = new Array(e.point['x'] - 5, e.point['y'] - 5)
                    let maxpoint = new Array(e.point['x'] + 5, e.point['y'] + 5)
                    let features : any = _this.map.queryRenderedFeatures([minpoint, maxpoint], {
                        layers: ['circle-1', 'circle-2']
                    });

                    if (!features.length) {
                        _this.map.getCanvas().style.cursor = '';
                        _this.popup.remove();
                        return
                    }

                    _this.map.getCanvas().style.cursor = 'pointer';

                    let feat = features[0];
                    let tooltip = feat.properties.tooltip;

                    _this.popup.setLngLat(_this.map.unproject(e.point))
                        .setHTML("<div><h3>Tooltip</h3>"+
                            "<li>Value: " + tooltip + "<li></div>")
                        .addTo(_this.map);

                }, 12, false);
               
            	_this.map.on('mousemove', onMouseMove);
	        }

            function addClick() {
                _this.map.off('click');

                var onClick : Function = MapboxMap.debounce(function(e) {
                    let minpoint = new Array(e.point['x'] - 5, e.point['y'] - 5)
                    let maxpoint = new Array(e.point['x'] + 5, e.point['y'] + 5)
                    let features : any = _this.map.queryRenderedFeatures([minpoint, maxpoint], {
                        layers: ['circle-1', 'circle-2']
                    });

                    if (!features.length) {return}

                    _this.map.easeTo({
                        center: features[0].geometry.coordinates,
                        zoom: 15,
                        duration: 0
                    });
                }, 12, false);
               
                _this.map.on('click', onClick);
            };
            

        function runload() {
            onUpdate();
            addPopup();
            addClick();
            let bounds : any = turf.bbox(turf.featureCollection(features));
            _this.map.easeTo( {
                duration: 0,
                pitch: 0,
                bearing: 0
            });
            _this.map.fitBounds(bounds, {padding: 25} );
            _this.firstRun = false;
        }

        if (_this.firstRun) {
            _this.map.once('load', runload);
        }
        else {
            runload();
        }
        
    }

        @logExceptions()
        public destroy(): void {
            console.log("removing map with destroy")
            this.map.remove();
        }
    }
}