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
        private settings: VisualSettings;
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
                style: 'mapbox://styles/mapbox/light-v9', //stylesheet location
                center: [-74.50, 40], // starting position
                zoom: 2 // starting zoom
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

            // Names of data values
            //let categoryName = dataView.metadata.columns[3].displayName;
            //let measureName = dataView.metadata.columns[2].displayName;

            //Color palette selected by user

            let limits = chroma.limits(domain, 'k', 8);
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

            console.log('update');

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
                    _this.map.addSource('data', {type: "geojson", data: geojson_data})
                }

                if (!_this.map.getLayer('circle')) {
                    _this.map.addLayer({
                        id: "circle",
                        source: "data",
                        type: "circle",
                        paint: {
                            "circle-color": {
                                "property": "color",
                                "type": "identity"
                            },
                            "circle-radius": {
                                "stops": [[0,0.1],[16,15]]
                            },
                            "circle-stroke-width": {
                                "stops": [[0,0.1],[20,1]]
                            },
                            "circle-stroke-color": "grey"
                        }
                    }, 'waterway-label')
                }
            }

            function addPopup() {
                _this.map.off('mousemove');
                _this.map.off('mouseleave');

            	_this.map.on('mousemove', 'circle', function(e) {

			        _this.map.getCanvas().style.cursor = 'pointer';

                    let feat = e.features[0]
                    let tooltip = feat.properties.tooltip

			        _this.popup.setLngLat(e.features[0].geometry.coordinates)
			            .setHTML("<div><h3>Tooltip</h3>"+
			            	"<li>Value: " + tooltip + "<li></div>")
			            .addTo(_this.map);
		    	});

			    _this.map.on('mouseleave', 'circle', function() {
			        _this.map.getCanvas().style.cursor = '';
			        _this.popup.remove();
			    });

	        }

	        this.map.on('load', function() {
            	onUpdate();
            	addPopup();
                let bounds : any = turf.bbox(geojson_data)
                _this.map.fitBounds(bounds, {padding: 25})
            })

            if (this.map.loaded) {
                onUpdate();
                addPopup();
                let bounds : any = turf.bbox(geojson_data)
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