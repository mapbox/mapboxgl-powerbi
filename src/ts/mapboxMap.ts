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
        private dataView: DataView;
        private popup: mapboxgl.Popup;
        private host: IVisualHost;
        private categoryName: string = "";
        private measureName: string = "";
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

            mapboxgl.accessToken = this.MAPBOX_ACCESS_TOKEN

            this.map = new mapboxgl.Map(this.mapOptions);
            this.map.addControl(new mapboxgl.NavigationControl());
            this.map.addControl(new mapboxgl.ScaleControl({
                maxWidth: 80,
                unit: 'imperial'
            }));
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

            var geojson_data : GeoJSON.FeatureCollection<GeoJSON.GeometryObject> = {
                "type": "FeatureCollection",
                "features": []
            }

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
                geojson_data.features.push(feat)
            });
            return geojson_data
        }


        @logExceptions()
        public update(options: VisualUpdateOptions) {

            if (!options.dataViews || !options.dataViews[0]) return;

            var _this = this
            
            this.dataView = options.dataViews[0];
            const geojson_data = MapboxMap.converter(this.dataView, this.host);

            this.popup = new mapboxgl.Popup({
		        closeButton: false,
		        closeOnClick: false
		    });

            function onUpdate() {

                if (_this.map.getSource('data')) {
                    var source : any = _this.map.getSource('data')
                    source.setData(geojson_data);
                }

                else {
                    _this.map.addSource('data', {
                        type: "geojson", 
                        data: geojson_data, 
                        buffer: 0, 
                        maxzoom: 12,
                        cluster: true,
                        clusterMaxZoom: 8,
                        clusterRadius: 40
                    })
                }

                if (!_this.map.getLayer('circle-cluster')) {
                    _this.map.addLayer({
                        id: "circle-cluster",
                        source: "data",
                        type: "circle",
                        maxzoom: 9,
                        paint: {
                            "circle-color": {
                                "property": "point_count",
                                "type": "exponential",
                                "stops": [
                                    [0, chroma.brewer.YlGnBu[0]],
                                    [1000, chroma.brewer.YlGnBu[1]],
                                    [5000, chroma.brewer.YlGnBu[2]],
                                    [10000, chroma.brewer.YlGnBu[3]]
                                ]
                            },
                            "circle-radius": {
                                "property": "point_count",
                                "type": "exponential",
                                "stops": [
                                    [0,10],
                                    [1000,20],
                                    [5000,25],
                                    [10000,30]
                                ]
                            }
                        },
                        filter: ["has", "point_count"],
                    }, 'waterway-label')
                }

                if (!_this.map.getLayer('cluster-label')) {
                    _this.map.addLayer({
                        id: "cluster-label",
                        maxzoom: 9,
                        type: "symbol",
                        source: "data",
                        filter: ["has", "point_count"],
                        layout: {
                            "text-field": "{point_count_abbreviated}",
                            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                            "text-size": 12
                        }
                    });
                }

                if (!_this.map.getLayer('3d-buildings')) {
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
                }


                if (!_this.map.getLayer('circle-raw')) {
                    _this.map.addLayer({
                        id: "circle-raw",
                        source: "data",
                        type: "circle",
                        minzoom: 9,
                        paint: {
                            "circle-color": {
                                "property": "color",
                                "type": "identity"
                            },
                            "circle-radius": {
                                "stops": [
                                [0,0.1],[12,3],[20,12]]
                            }
                        },
                        filter: ["!has", "point_count"],
                    }, 'waterway-label')
                };
            }
        

            function addPopup() {
                _this.map.off('mousemove');
                _this.map.off('mouseleave');

                function onMouseMove(e) {
                    _this.map.getCanvas().style.cursor = 'pointer';

                    let feat = e.features[0]
                    let tooltip = feat.properties.tooltip

                    _this.popup.setLngLat(e.features[0].geometry.coordinates)
                        .setHTML("<div><h3>Tooltip</h3>"+
                            "<li>Value: " + tooltip + "<li></div>")
                        .addTo(_this.map);
                };
               
            	_this.map.on('mousemove', 'circle-raw', onMouseMove);

			    _this.map.on('mouseleave', 'circle-raw', function() {
			        _this.map.getCanvas().style.cursor = '';
			        _this.popup.remove();
			    });
	        }

            function addClick() {
                _this.map.off('click');

                function onClick(e) {
                    let feat = e.features[0]

                    _this.map.easeTo({
                        center: feat.geometry.coordinates,
                        zoom: 15
                    });

                };
               
                _this.map.on('click', 'circle-raw', onClick);
            }

	        this.map.once('load', function() {
            	onUpdate();
            	addPopup();
                addClick();
                let bounds : any = turf.bbox(geojson_data)
                _this.map.fitBounds(bounds, {padding: 25})
            })

            if (this.map.loaded) {
                onUpdate();
                addPopup();
                addClick();
                let bounds : any = turf.bbox(geojson_data)
                _this.map.setPitch(0);
                _this.map.setBearing(0);
                _this.map.fitBounds(bounds, {
                    padding: 25,
                    maxZoom: 15,
                    linear: true
                })
            }
        }

        @logExceptions()
        public destroy(): void {
            console.log("removing map with destroy")
            this.map.remove();
        }
    }
}