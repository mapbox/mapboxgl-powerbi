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

        function getLimits(geojson_data, myproperty) {
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

    function onUpdate(map, features, settings, zoomChanged, category) {
        if (!map.getSource('data')) {
            return;
        }

        let source : any = map.getSource('data');
        source.setData( turf.featureCollection(features));

        map.setLayoutProperty('circle', 'visibility', settings.circle.show ? 'visible' : 'none');
        map.setLayoutProperty('cluster', 'visibility', settings.cluster.show ? 'visible' : 'none');
        map.setLayoutProperty('heatmap', 'visibility', settings.heatmap.show ? 'visible' : 'none');
        if (map.getLayer('choropleth-layer')) {
            map.setLayoutProperty('choropleth-layer', 'visibility', settings.choropleth.show ? 'visible' : 'none');
        }

        if (settings.choropleth.show) {
                let choropleth = map.getSource('choropleth-source');
                map.removeLayer('choropleth-layer');
                const choroplethLayer = mapboxUtils.decorateLayer({
                    id: 'choropleth-layer',
                    type: "fill",
                    source: 'choropleth-source',
                    "source-layer": settings.choropleth.vectorLayer
                });
                map.addLayer(choroplethLayer);
                const limits = getLimits(features, 'colorValue');
                let stops = [];
                if (limits.min && limits.max) {
                    features.forEach( row => {
                        const green = ((row.properties.colorValue / limits.max) * 255);
                        const color = "rgba(" + 50 + ", " + green + ", " + 10 + ", 0.7)";
                        stops.push([row.properties.location, color]);
                    });
                    map.setPaintProperty('choropleth-layer', 'fill-color', {
                        "property": settings.choropleth.vectorProperty,
                        "type": "categorical",
                        "stops": stops
                    });
                }
            }
        if (settings.cluster.show) {
                const limits = getLimits(features, settings.cluster.aggregation);
                if (limits.min && limits.max) {
                    map.setPaintProperty('cluster', 'circle-color', [
                        "rgb",
                            ['interpolate', ['linear'], ['get', settings.cluster.aggregation], limits.min, 20, limits.max, 235],
                            ['-', 255, ['interpolate', ['linear'], ['get', settings.cluster.aggregation], limits.min, 20, limits.max, 235]],
                            50, 
                    ]);

                    map.setPaintProperty('cluster', 'circle-radius', [
                        'interpolate', ['linear'], ['get', settings.cluster.aggregation],
                        limits.min, 10,
                        limits.max, 25,
                    ]);
                }
            }
        if (settings.circle.show) {
                if (category != null) {
                    map.setPaintProperty('circle', 'circle-color', {
                        property: 'color',
                        type: 'identity',
                    });
                } else {
                    map.setPaintProperty('circle', 'circle-color', settings.circle.color);
                }
                const limits = getLimits(features, 'size');
                if (limits.min !== null && limits.max !== null) {
                    map.setPaintProperty('circle', 'circle-radius', [
                        'interpolate', ['linear'], ['get', 'size'],
                        limits.min, 1,
                        limits.max, 4 * settings.circle.radius,
                    ])
                } else {
                    map.setPaintProperty('circle', 'circle-radius', settings.circle.radius);
                }
                map.setPaintProperty('circle', 'circle-blur', settings.circle.blur / 100);
                map.setPaintProperty('circle', 'circle-opacity', settings.circle.opacity / 100);
                map.setPaintProperty('circle', 'circle-stroke-width', settings.circle.strokeWidth);
                map.setPaintProperty('circle', 'circle-stroke-opacity', settings.circle.strokeOpacity / 100);
                map.setPaintProperty('circle', 'circle-stroke-color', settings.circle.strokeColor);

            }
            if (settings.heatmap.show) {
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

        return true;
    }


    export class MapboxMap implements IVisual {
        private map: mapboxgl.Map;
        private mapDiv: HTMLDivElement;
        private host: IVisualHost;
        private features: any[];
        private settings: MapboxSettings;
        private popup: mapboxgl.Popup;
        private mapStyle: string = "";
        private useClustering : boolean = false;
        private cluster: any;
        private category: any;

         /**
         * This function returns the values to be displayed in the property pane for each object.
         * Usually it is a bind pass of what the property pane gave you, but sometimes you may want to do
         * validation and return other values/defaults
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            return MapboxSettings.enumerateObjectInstances(this.settings || MapboxSettings.getDefault(), options);
        }

        private getFeatures(useClustering) {
            let ret = null;
            if (useClustering) {
                const worldBounds = [-180.0000, -90.0000, 180.0000, 90.0000];
                ret = this.cluster.getClusters(worldBounds, Math.floor(this.map.getZoom() - 3 ) );
            } else {
                ret = this.features;
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
                        max: -Infinity,
                        tooltip: '',
                    };
                },
                map: function(properties) {
                    const count = 1;
                    const sum = Number(properties["size"]);
                    const min = Number(properties["size"]);
                    const max = Number(properties["size"]);
                    return {
                        count,
                        sum,
                        min, 
                        max,
                        tooltip: `Count: ${count},Sum: ${sum}, Min: ${sum}, Max: ${max}`
                    };
                },
                reduce: function(accumulated, properties) {
                    accumulated.sum += Math.round(properties.sum * 100) / 100;
                    accumulated.count += properties.count;
                    accumulated.min = Math.round(Math.min(accumulated.min, properties.min) * 100) / 100;
                    accumulated.max = Math.round(Math.max(accumulated.max, properties.max) * 100) / 100;
                    accumulated.avg = Math.round(100 * accumulated.sum / accumulated.count) / 100;
                    accumulated.tooltip = `Count: ${accumulated.count},Sum: ${accumulated.sum},Min: ${accumulated.min},Max: ${accumulated.max}`;
                }
            })

            this.map.on('data', (data) => {
                if (data.dataType == 'source' && data.sourceId == 'choropleth-source') {
                    let choroplethLayer = this.map.getLayer('choropleth-layer');
                    if (!choroplethLayer) {
                        const source : any =  this.map.getSource('choropleth-source');
                        const vectorLayers : any[] = source.vectorLayers;
                        if (vectorLayers && vectorLayers.length > 0) {
                            if (this.settings.choropleth.vectorLayer == '') {
                                this.settings.choropleth.vectorLayer = vectorLayers[0].id;
                            }
                        }
                    }
                }
            });

            this.map.on('style.load', (e) => {
                let style = e.target;
                this.map.addSource('data', {
                    type: 'geojson',
                    data: turf.featureCollection([]),
                    buffer: 10
                })
                this.map.addSource('choropleth-source', {
                    type: 'vector',
                    url: 'mapbox://mapbox.us_census_states_2015',
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
                onUpdate(this.map, this.getFeatures(this.useClustering), this.settings, false, this.category) 
            });

            this.map.on('load', () => {

                onUpdate(this.map, this.getFeatures(this.useClustering), this.settings, false, this.category)
                mapboxUtils.addPopup(this.map, this.popup);
                mapboxUtils.addClick(this.map);
            });
            this.map.on('zoom', () => { if (this.useClustering) { onUpdate(this.map, this.getFeatures(this.useClustering), this.settings, true, this.category) }});

        }

        @logExceptions()
        public update(options: VisualUpdateOptions) {
            const dataView: DataView = options.dataViews[0];
            this.settings = MapboxSettings.parse<MapboxSettings>(dataView);
            this.useClustering = this.settings.cluster.show;
            
            // Only run this step if there are lat/long values to parse
            // and accessToken is set in options
            if (options.dataViews[0].metadata.columns.length < 2 || !this.settings.api.accessToken) { 
                return 
            };

            this.features  = mapboxConverter.convert(dataView, this.host);
            if (this.useClustering) {
                this.cluster.load(this.features);
            }

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


            // Check is category field is set
            const columns : any = dataView.table.columns;
            this.category = columns.find( column => {
                return column.roles.category;
            });

            // If the map is loaded and style has not changed in this update
            // then we should update right now.
            if (this.map.loaded() && !styleChanged) {
                onUpdate(this.map, this.getFeatures(this.useClustering), this.settings, false, this.category);
            }
        }

        @logExceptions()
        public destroy(): void {
            this.map.remove();
            this.map = null;
        }
    }
}
