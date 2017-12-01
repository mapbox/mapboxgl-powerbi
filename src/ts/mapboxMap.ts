module powerbi.extensibility.visual {
    declare var debug : any;
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
            let min = null;
            let max = null;
            turf.propEach(turf.featureCollection(geojson_data), function(currentProperties, featureIndex) {
                if (currentProperties[myproperty]) {
                    const value = Math.round(Number(currentProperties[myproperty]) * 100 / 100);
                    if (!min || value < min) { min = value }
                    if (!max || value > max) { max = value }
                }
            })
            // Min and max must not be equal becuse of the interpolation. 
            // let's make sure with the substraction
            return {
                min: min - 1,
                max,
            }
        }

    function onUpdate(map, features, settings, zoomChanged) {
        if (!map.getSource('data')) {
            return;
        }

        let source : any = map.getSource('data');
        source.setData( turf.featureCollection(features));

        switch (settings.api.layerType) {
            case 'cluster': {
                map.setLayoutProperty('circle', 'visibility', 'none');
                map.setLayoutProperty('heatmap', 'visibility', 'none');
                map.setLayoutProperty('cluster', 'visibility', 'visible');
                const limits = getFeatureDomain(features, settings.api.aggregation);
                if (limits.min && limits.max) {
                    map.setPaintProperty('cluster', 'circle-color', [
                        "rgb",
                            ['interpolate', ['linear'], ['get', settings.api.aggregation], limits.min, 20, limits.max, 235],
                            ['-', 255, ['interpolate', ['linear'], ['get', settings.api.aggregation], limits.min, 20, limits.max, 235]],
                            50, 
                    ]);

                    map.setPaintProperty('cluster', 'circle-radius', [
                        'interpolate', ['linear'], ['get', settings.api.aggregation],
                        limits.min, 10,
                        limits.max, 25,
                    ]);
                }
                break;
            }
            case 'circle': {
                map.setLayoutProperty('circle', 'visibility', 'visible');
                map.setLayoutProperty('heatmap', 'visibility', 'none');
                map.setLayoutProperty('cluster', 'visibility', 'none');
                map.setPaintProperty('circle', 'circle-color', {
                    property: 'color',
                    type: 'identity',
                });
                const limits = getFeatureDomain(features, 'size');
                if (limits.min && limits.max) {
                    map.setPaintProperty('circle', 'circle-radius', [
                        'interpolate', ['linear'], ['get', 'size'],
                        limits.min, 1,
                        limits.max, 20,
                    ])
                }

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

                break;
            }
            case 'heatmap': {
                map.setLayoutProperty('circle', 'visibility', 'none');
                map.setLayoutProperty('heatmap', 'visibility', 'visible');
                map.setLayoutProperty('cluster', 'visibility', 'none');

                map.setPaintProperty('heatmap', 'heatmap-radius', settings.heatmap.radius);
                map.setPaintProperty('heatmap', 'heatmap-weight', settings.heatmap.weight);
                map.setPaintProperty('heatmap', 'heatmap-intensity', settings.heatmap.intensity);
                map.setPaintProperty('heatmap', 'heatmap-opacity', settings.heatmap.opacity / 100);
                map.setPaintProperty('heatmap', 'heatmap-color', [ "interpolate", ["linear"], ["heatmap-density"],
                    0, "rgba(0, 0, 255, 0)",
                    0.1, "royalblue",
                    0.3, "cyan",
                    0.5, "lime",
                    0.7, "yellow",
                    1, settings.heatmap.color]);
            }

        }
        return true;
    }


    export class MapboxMap implements IVisual {
        private map: mapboxgl.Map;
        private mapDiv: HTMLDivElement;
        private host: IVisualHost;
        private mapboxData: MapboxData;
        private settings: MapboxSettings;
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
            const settings : any = this.settings || MapboxSettings.getDefault();
            let instances = MapboxSettings.enumerateObjectInstances(
                settings,
                options
            )['instances'];
            switch (options.objectName) {
                case 'api': {
                    let properties = instances[0].properties;

                    // Hide / show custom map style URL control
                    if (properties.style != 'custom') {
                        properties.style_url = "";
                        delete properties.style_url
                    } else if (!properties.style_url) {
                        properties.style_url = "";
                    }

                    // Hide / show cluster aggregation selector
                    if (properties.layerType == 'cluster') {
                        properties.aggregation = settings.api.aggregation;
                    } else {
                        delete properties.aggregation;
                    }
                    return { instances }
                }
                case 'heatmap': {
                    return { instances }
                }
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

            this.map.on('style.load', (e) => {
                let style = e.target;
                this.map.addSource('data', {
                    type: "geojson", 
                    data: turf.featureCollection([]),
                    buffer: 10
                })
                mapboxUtils.addBuildings(this.map);
                
                const clusterLayer = mapboxUtils.decorateLayer({
                    id: 'cluster',
                    source: 'data',
                    type: 'cluster'
                });
                this.map.addLayer(clusterLayer);

                const circleLayer = mapboxUtils.decorateLayer({
                    id: 'circle',
                    source: 'data',
                    type: 'circle'
                })
                this.map.addLayer(circleLayer);

                const heatmapLayer = mapboxUtils.decorateLayer({
                    id: 'heatmap',
                    source: 'data',
                    type: 'heatmap'
                });
                this.map.addLayer(heatmapLayer);
                onUpdate(this.map, this.getFeatures(this.useClustering), this.settings, false) 
            });

            this.map.on('load', () => {

                onUpdate(this.map, this.getFeatures(this.useClustering), this.settings, false)
                mapboxUtils.addPopup(this.map, this.popup);
                mapboxUtils.addClick(this.map);
            });
            this.map.on('zoom', () => { if (this.useClustering) { onUpdate(this.map, this.getFeatures(this.useClustering), this.settings, true) }});
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

            let styleChanged = false;
            let style = this.settings.api.style == 'custom' ? this.settings.api.style_url : this.settings.api.style;
            if (this.mapStyle != style) {
                this.mapStyle = style;
                styleChanged = true;
                this.map.setStyle(this.mapStyle);
            }

            // If the map is loaded and style has not changed in this update
            // then we should update right now.
            if (this.map.loaded() && !styleChanged) {
                onUpdate(this.map, this.getFeatures(this.useClustering), this.settings, false);
            }
        }

        @logExceptions()
        public destroy(): void {
            this.map.remove();
            this.map = null;
        }
    }
}
