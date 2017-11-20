module powerbi.extensibility.visual {
    declare var turf : any;
    declare var supercluster : any;
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

        function getFeatureDomain(geojson_data, myproperty) {
            let data_domain = []
            turf.propEach(turf.featureCollection(geojson_data), function(currentProperties, featureIndex) {
                if (currentProperties[myproperty]) {
                    data_domain.push(Math.round(Number(currentProperties[myproperty]) * 100 / 100))
                }
            })
            return data_domain
        }
        function createColorStops(stops_domain, scale) {
            let stops = []
            stops_domain.forEach(function(d) {
                stops.push([d, scale(d).hex()])
            });
            return stops
        }
        function createRadiusStops(stops_domain, min_radius, max_radius) {
            let stops = []
            let stops_len = stops_domain.length
            let count = 1
            stops_domain.forEach(function(d) {
                stops.push([d, min_radius + (count / stops_len * (max_radius - min_radius))])
                count += 1
            });
            return stops
        }

    function onUpdate(map, features, dataLayer, settings, zoomChanged) {
        if (map.getSource('data')) {
            let source : any = map.getSource('data');
            source.setData( turf.featureCollection(features));
            if (!zoomChanged) {
                map.removeLayer('data');
                map.addLayer(dataLayer);
            }
        }
        else {
            map.addSource('data', {
                type: "geojson", 
                data: turf.featureCollection(features),
                buffer: 10
            });

            mapboxUtils.addBuildings(map);

            map.addLayer(dataLayer);
        }

        if (settings.api.layerType == 'cluster') {
            const currentZoom = map.getZoom();
            const color = 'YlOrRd';
            const featureDomains = getFeatureDomain(features, 'sum');
            const length = featureDomains.length > 8 ? 8 : featureDomains.length;
            if (length > 0) {
                let stops_domain = chroma.limits(featureDomains, 'e', length)
                var scale = chroma.scale(color).domain(stops_domain).mode('lab')
                const colorStops = createColorStops(stops_domain, scale)
                const radiusStops = createRadiusStops(stops_domain, 10, 25);
                const repaint = true;
                if (repaint) {
                    map.setPaintProperty('data', 'circle-color', {
                        property: 'sum',
                        stops: colorStops
                    });

                    map.setPaintProperty('data', 'circle-radius', {
                        property: 'sum',
                        stops: radiusStops
                    });
                }
            }
        } else {


            let bounds : any = turf.bbox(turf.featureCollection(features));
            bounds = bounds.map( bound => {
                if (bound < -90) {
                    return -90;
                }
                if (bound > 90) {
                    return 90;
                }
                return bound;
            });

            map.easeTo( {
                duration: 500,
                pitch: 0,
                bearing: 0
            });
            map.fitBounds(bounds, {
                padding: 25
            });
        }
        return true;
    }


    export class MapboxMap implements IVisual {
        private map: mapboxgl.Map;
        private mapDiv: HTMLDivElement;
        private host: IVisualHost;
        private mapboxData: MapboxData;
        private settings: MapboxSettings;
        private dataLayer: mapboxgl.Layer;
        private popup: mapboxgl.Popup;
        private mapStyle: string = "";
        private useClustering : boolean = false;
        private cluster: any;

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

        private getFeatures(useClustering) {
            let ret = null;
            if (useClustering) {
                const worldBounds = [-180.0000, -90.0000, 180.0000, 90.0000];
                ret = this.cluster.getClusters(worldBounds, Math.floor(this.map.getZoom() - 3 ) );
            } else {
                ret = this.mapboxData.features;
            }
            return ret;
        }

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            //Map initialization    
            this.mapDiv = document.createElement('div');
            this.mapDiv.className = 'map';
            options.element.appendChild(this.mapDiv);
            
            let mapLegend: HTMLElement;
            mapLegend = document.createElement('legend');
            mapLegend.className = 'legend';
            mapLegend.id = 'legend';
            this.mapDiv.appendChild(mapLegend);

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
            this.map = new mapboxgl.Map(mapOptions);
            this.map.addControl(new mapboxgl.NavigationControl());

            const clusterRadius = 10;
            const clusterMaxZoom = 20;
            this.cluster = supercluster({
                radius: clusterRadius,
                maxZoom: clusterMaxZoom,
                initial: function() {
                    return {
                        count: 0,
                        sum: 0,
                        min: Infinity,
                        max: -Infinity
                    };
                },
                map: function(properties) {
                    return {
                        count: 1,
                        sum: Number(properties["size"]),
                        min: Number(properties["size"]),
                        max: Number(properties["size"])
                    };
                },
                reduce: function(accumulated, properties) {
                    accumulated.sum += Math.round(properties.sum * 100) / 100;
                    accumulated.count += properties.count;
                    accumulated.min = Math.round(Math.min(accumulated.min, properties.min) * 100) / 100;
                    accumulated.max = Math.round(Math.max(accumulated.max, properties.max) * 100) / 100;
                    accumulated.avg = Math.round(100 * accumulated.sum / accumulated.count) / 100;
                }
            })

            this.map.on('style.load', () => onUpdate(this.map, this.getFeatures(this.useClustering), this.dataLayer, this.settings, false));
            this.map.on('load', () => onUpdate(this.map, this.getFeatures(this.useClustering), this.dataLayer, this.settings, false));
            this.map.on('zoom', () => { if (this.useClustering) { onUpdate(this.map, this.getFeatures(this.useClustering), this.dataLayer, this.settings, true) }});
            mapboxUtils.addPopup(this.map, this.popup);
            mapboxUtils.addClick(this.map);
        }

        @logExceptions()
        public update(options: VisualUpdateOptions) {
            const dataView: DataView = options.dataViews[0];
            this.settings = MapboxSettings.parse<MapboxSettings>(dataView);
            this.useClustering = this.settings.api.layerType == 'cluster';
            
            // Only run this step if there are lat/long values to parse
            // and accessToken is set in options
            if (options.dataViews[0].metadata.columns.length < 2 || !this.settings.api.accessToken) { 
                return 
            };

            this.mapboxData  = mapboxConverter.convert(dataView, this.host);
            this.cluster.load(this.mapboxData.features);

            if (mapboxgl.accessToken != this.settings.api.accessToken) {
                mapboxgl.accessToken = this.settings.api.accessToken;
            }

            const layer = mapboxUtils.decorateLayer({
                id: 'data',
                source: 'data',
                type: this.settings.api.layerType,
            }, dataView.table.columns, this.mapboxData.maxSize)

            if (this.dataLayer != layer) {
                this.dataLayer = layer;
            }

            let styleChanged = false;
            if (this.mapStyle != this.settings.api.style) {
                this.mapStyle = this.settings.api.style;
                styleChanged = true;
                this.map.setStyle(this.mapStyle);
            }

            // If the map is loaded and style has not changed in this update
            // then we should update right now.
            if (this.map.loaded && !styleChanged) {
                onUpdate(this.map, this.getFeatures(this.useClustering), this.dataLayer, this.settings, false);
            }
        }

        @logExceptions()
        public destroy(): void {
            this.map.remove();
            this.map = null;
        }
    }
}
