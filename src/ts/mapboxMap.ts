module powerbi.extensibility.visual {
    declare var debug : any;
    declare var turf : any;
    declare var supercluster : any;


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
            map.setLayoutProperty('choropleth-layer', 'visibility', settings.choropleth.display() ? 'visible' : 'none');
        }

        if (settings.choropleth.display()) {
            let choropleth = map.getSource('choropleth-source');
            if (this.vectorTileUrl != settings.choropleth.vectorTileUrl) {
                if (choropleth) {
                    map.removeSource('choropleth-source');
                }

                map.addSource('choropleth-source', {
                    type: 'vector',
                    url: settings.choropleth.vectorTileUrl,
                })
                this.vectorTileUrl = settings.choropleth.vectorTileUrl;
            }

            choropleth = map.getSource('choropleth-source');

            if (map.getLayer('choropleth-layer')) {
                map.removeLayer('choropleth-layer');
            }
            const choroplethLayer = mapboxUtils.decorateLayer({
                id: 'choropleth-layer',
                type: "fill",
                source: 'choropleth-source',
                "source-layer": settings.choropleth.sourceLayer
            });
            map.addLayer(choroplethLayer);
            const limits = mapboxUtils.getLimits(features, 'colorValue');
            let colors = ['match', ['get', settings.choropleth.vectorProperty]];
            if (limits.min && limits.max) {
                features.map( row => {
                    const green = ((row.properties.colorValue / limits.max) * 255);
                    const color = "rgba(" + 50 + ", " + green + ", " + 10 + ", 0.7)";
                    colors.push(row.properties.location);
                    colors.push(color);
                });

                // Add transparent as default so that we only see regions
                // for which we have data values
                colors.push('rgba(0,0,0,0)');

                map.setPaintProperty('choropleth-layer', 'fill-color', colors);
            }
        }
        if (settings.cluster.show) {
            const limits = mapboxUtils.getLimits(features, settings.cluster.aggregation);
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
            const limits = mapboxUtils.getLimits(features, 'size');
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
        private errorDiv: HTMLDivElement;
        private host: IVisualHost;
        private features: any[];
        private settings: MapboxSettings;
        private popup: mapboxgl.Popup;
        private mapStyle: string = "";
        private vectorTileUrl: string = "";
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

            this.errorDiv = document.createElement('div');
            this.errorDiv.className = 'error';
            options.element.appendChild(this.errorDiv);
            
            this.popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false
            });

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

        }

        private addMap() {
            if (this.map) {
                return
            }

            const mapOptions = {
                container: this.mapDiv,
            }

            //If the map container doesnt exist yet, create it
            this.map = new mapboxgl.Map(mapOptions);
            this.map.addControl(new mapboxgl.NavigationControl());

            this.map.on('data', (data) => {
                if (data.dataType == 'source' && data.sourceId == 'choropleth-source') {
                    let choroplethLayer = this.map.getLayer('choropleth-layer');
                    if (!choroplethLayer) {
                        const source : any =  this.map.getSource('choropleth-source');
                        const vectorLayers : any[] = source.vectorLayers;
                        if (vectorLayers && vectorLayers.length > 0) {
                            if (this.settings.choropleth.sourceLayer == '') {
                                this.settings.choropleth.sourceLayer = vectorLayers[0].id;
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

        private removeMap() {
            if (this.map) {
                this.map.remove();
                this.map = null;
                this.mapStyle = "";
                this.vectorTileUrl = "";
            }
        }

        private validateOptions(options: VisualUpdateOptions) {
            this.errorDiv.style.display = 'none';
            this.errorDiv.innerText = '';

            // Check for Access Token
            if (!this.settings.api.accessToken) {
                this.errorDiv.innerText = 'Access Token is not set. Please set it on the options pane.';
                return false;
            }

            // Check for Location properties
            const roles : any = options.dataViews[0].metadata.columns.map( column => {
                return Object.keys(column.roles);
            }).reduce( (acc, curr) => {
                curr.map( role => {
                    acc[role] = true;
                });
                return acc;
            }, {});

            if (!(roles.latitude && roles.longitude) && !roles.location) {
                this.errorDiv.innerText = 'No GEO data fields are added. Please set either location or latitude and longitude.';
                return false;
            }

            return true;
        }

        @mapboxUtils.logExceptions()
        public update(options: VisualUpdateOptions) {
            const dataView: DataView = options.dataViews[0];
            this.settings = MapboxSettings.parse<MapboxSettings>(dataView);
            this.useClustering = this.settings.cluster.show;
            
            if (!this.validateOptions(options)) {
                this.errorDiv.style.display = 'block';
                this.removeMap();
                return false;
            }

            if (!this.map) {
                this.addMap();
            }

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

        @mapboxUtils.logExceptions()
        public destroy(): void {
            this.removeMap();
        }
    }
}
