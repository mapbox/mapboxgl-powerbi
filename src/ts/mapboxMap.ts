module powerbi.extensibility.visual {
    declare var debug : any;
    declare var turf : any;
    declare var supercluster : any;

    function zoomToData(map, features) {
        let bounds : any = features.bounds;
        if (!bounds && features.rawData) {
            bounds = turf.bbox(turf.helpers.featureCollection(features.rawData));
            bounds = bounds.map( bound => {
                if (bound < -90) {
                    return -90;
                }
                if (bound > 90) {
                    return 90;
                }
                return bound;
            });
        }

        if (bounds) {
            map.easeTo( {
                duration: 500,
                pitch: 0,
                bearing: 0
            });
            map.fitBounds(bounds, {
                padding: 25
            });
        }
    }


    function onUpdate(map, features, settings, zoom, category) {
        if (!map.getSource('data')) {
            return;
        }

        if (features.clusterData || features.rawData) {
            let source : any = map.getSource('data');
            source.setData( turf.helpers.featureCollection(features.clusterData || features.rawData));
        }

        map.setLayoutProperty('circle', 'visibility', settings.circle.show ? 'visible' : 'none');
        map.setLayoutProperty('cluster', 'visibility', settings.cluster.show ? 'visible' : 'none');
        map.setLayoutProperty('cluster-label', 'visibility', settings.cluster.show ? 'visible' : 'none');
        map.setLayoutProperty('heatmap', 'visibility', settings.heatmap.show ? 'visible' : 'none');
        if (map.getLayer('choropleth-layer')) {
            map.setLayoutProperty('choropleth-layer', 'visibility', settings.choropleth.display() ? 'visible' : 'none');
        }

        if (settings.choropleth.display()) {

            if (this.vectorTileUrl != settings.choropleth.vectorTileUrl) {
                if (map.getSource('choropleth-source')) {
                    map.removeSource('choropleth-source');
                }
                this.vectorTileUrl = settings.choropleth.vectorTileUrl;
            }

            if (!map.getSource('choropleth-source')) {
                map.addSource('choropleth-source', {
                    type: 'vector',
                    url: settings.choropleth.vectorTileUrl,
                });
            }

            const choroplethLayer = mapboxUtils.decorateLayer({
                id: 'choropleth-layer',
                type: "fill",
                source: 'choropleth-source',
                "source-layer": settings.choropleth.sourceLayer
            });

            if (!map.getLayer('choropleth-layer')) {
                map.addLayer(choroplethLayer, 'cluster');
            }

            const limits = mapboxUtils.getLimits(features.choroplethData, 'colorValue');

            if (limits.min && limits.max) {
                let colorStops = chroma.scale([settings.choropleth.minColor,settings.choropleth.maxColor]).domain([limits.min, limits.max]);
                let colors = ['match', ['get', settings.choropleth.vectorProperty]];
                let outlineColors = ['match', ['get', settings.choropleth.vectorProperty]];
                
                features.choroplethData.map( row => {
                    const color = colorStops(row.properties.colorValue);
                    var outlineColor : any = colorStops(row.properties.colorValue)
                    outlineColor = outlineColor.darken(2);
                    colors.push(row.properties.location);
                    colors.push(color.toString());
                    outlineColors.push(row.properties.location);
                    outlineColors.push(outlineColor.toString());
                });

                // Add transparent as default so that we only see regions
                // for which we have data values
                colors.push('rgba(0,0,0,0)');
                outlineColors.push('rgba(0,0,0,0)');

                map.setPaintProperty('choropleth-layer', 'fill-color', colors);
                map.setPaintProperty('choropleth-layer', 'fill-outline-color', outlineColors)
            }
        }
        if (settings.cluster.show) {

            const limits = mapboxUtils.getLimits(features.clusterData, settings.cluster.aggregation);
            if (limits.min && limits.max) {
                map.setPaintProperty('cluster', 'circle-color', [
                    'interpolate', ['linear'], ['get', settings.cluster.aggregation],
                    limits.min, settings.cluster.minColor,
                    limits.max, settings.cluster.maxColor
                ]);

                map.setPaintProperty('cluster', 'circle-radius', [
                    'interpolate', ['linear'], ['get', settings.cluster.aggregation],
                    limits.min, settings.cluster.radius,
                    limits.max, 3 * settings.cluster.radius,
                ]);

                map.setLayoutProperty('cluster-label', 'text-field', `{${settings.cluster.aggregation}}`);
            }
        }
        if (settings.circle.show) {

            const colorLimits = mapboxUtils.getLimits(features.rawData, 'colorValue');
            const sizeLimits = mapboxUtils.getLimits(features.rawData, 'sizeValue');

            if (sizeLimits.min !== null && sizeLimits.max !== null) {
                map.setPaintProperty('circle', 'circle-radius', [
                    "interpolate", ["linear"], ["zoom"],
                    0, [
                        "interpolate", ["exponential", 1],
                        ["to-number", ['get', 'sizeValue']],
                        sizeLimits.min, 1,
                        sizeLimits.max, settings.circle.radius
                    ],
                    18, [
                        "interpolate", ["exponential", 1],
                        ["to-number", ["get", "sizeValue"]],
                        sizeLimits.min, 1 * settings.circle.scaleFactor,
                        sizeLimits.max, settings.circle.radius  * settings.circle.scaleFactor,
                    ]
                ]
                );
            } else {
                map.setPaintProperty('circle', 'circle-radius', [
                    'interpolate', ['linear'], ['zoom'],
                    0, settings.circle.radius,
                    18, settings.circle.radius * settings.circle.scaleFactor
                ]);
            }

            if (colorLimits.min !== null && colorLimits.max !== null) {
                map.setPaintProperty('circle', 'circle-color', [
                        "interpolate", ["exponential", 1],
                        ["to-number", ['get', 'colorValue']],
                        colorLimits.min, settings.circle.minColor,
                        colorLimits.max, settings.circle.maxColor
                    ]
                );
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
        if (zoom) {
            zoomToData(map, features)
        }

        return true;
    }

    class Features {
        rawData: any[] = null;
        choroplethData: any[] = null;
        clusterData: any[] = null;
        bounds: any[] = null;
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

        // We might need to transform the raw data coming from PowerBI
        // for clustered display we want to use the cluster
        // for choropleth we need to aggregate per location as
        // we mustn't have more than one values for a location
        private getFeatures(): Features {
            let ret : Features = new Features();
            if (this.settings.cluster.show) {
                const worldBounds = [-180.0000, -90.0000, 180.0000, 90.0000];
                this.cluster.options.radius = this.settings.cluster.clusterRadius;
                this.cluster.options.maxZoom = this.settings.cluster.clusterMaxZoom;
                ret.clusterData = this.cluster.getClusters(worldBounds, Math.floor(this.map.getZoom()) );
            }

            if (this.settings.choropleth.show) {
                let values = {}
                this.features.map( feature => {
                    if (!values[feature.properties.location]) {
                        values[feature.properties.location] = feature;
                    } else {
                        values[feature.properties.location].properties.colorValue += feature.properties.colorValue;
                    }
                })
                ret.choroplethData = Object.keys(values).map( key => {
                    return values[key];
                });

                const source : any = this.map.getSource('choropleth-source');
                if (source && source.tileBounds) {
                    ret.bounds = source.tileBounds.bounds;
                }
            }

            const hasCoords = this.features.length > 0 &&
                this.features[0].geometry
            if (hasCoords) {
                ret.rawData = this.features;
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

            this.cluster = supercluster({
                radius: 10,
                maxZoom: 20,
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
                    const sum = Number(properties["colorValue"]);
                    const min = Number(properties["colorValue"]);
                    const max = Number(properties["colorValue"]);
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
            });
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

            this.map.on('style.load', (e) => {
                let style = e.target;

                // For default styles place data under waterway-label layer
                let firstSymbolId = 'waterway-label';

                if (this.settings.api.style=='mapbox://styles/mapbox/satellite-v9?optimize=true' ||
                        this.settings.api.style == 'custom') {
                    //For custom style find the lowest symbol layer to place data underneath
                    firstSymbolId = ''
                    let layers = this.map.getStyle().layers;
                    for (var i = 0; i < layers.length; i++) {
                        if (layers[i].type === 'symbol') {
                            firstSymbolId = layers[i].id;
                            break;
                        }
                    }
                }
            
                this.map.addSource('data', {
                    type: 'geojson',
                    data: turf.helpers.featureCollection([]),
                    buffer: 0
                });
                
                const clusterLayer = mapboxUtils.decorateLayer({
                    id: 'cluster',
                    source: 'data',
                    type: 'cluster'
                });
                this.map.addLayer(clusterLayer, firstSymbolId);

                const clusterLabelLayer = mapboxUtils.decorateLayer({
                    id: 'cluster-label',
                    type: 'symbol',
                    source: 'data',
                    layout: {
                        'text-field': `{${this.settings.cluster.aggregation}}`,
                        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                        'text-size': 12
                    },
                    paint: {
                        "text-halo-color": "white",
                        "text-halo-width": 0.5
                    }
                });
                this.map.addLayer(clusterLabelLayer);

                const circleLayer = mapboxUtils.decorateLayer({
                    id: 'circle',
                    source: 'data',
                    type: 'circle'
                });
                this.map.addLayer(circleLayer, firstSymbolId);

                const heatmapLayer = mapboxUtils.decorateLayer({
                    id: 'heatmap',
                    source: 'data',
                    type: 'heatmap'
                });
                this.map.addLayer(heatmapLayer, firstSymbolId);

                onUpdate(this.map, this.getFeatures(), this.settings, false, this.category) 
            });

            this.map.on('load', () => {
                onUpdate(this.map, this.getFeatures(), this.settings, true, this.category)
                mapboxUtils.addPopup(this.map, this.popup);
                mapboxUtils.addClick(this.map);
            });
            this.map.on('zoomend', () => {
                if (this.settings.cluster.show) {
                    onUpdate(this.map, this.getFeatures(), this.settings, false, this.category)
                }
            });
        }

        private removeMap() {
            if (this.map) {
                this.map.remove();
                this.map = null;
                this.mapStyle = "";
                this.vectorTileUrl = "";
            }
        }

        private createLinkElement(title, url): Element {
            let linkElement = document.createElement("a");
            linkElement.textContent = "Get a Mapbox Access Token";
            linkElement.setAttribute("title", "Get a Mapbox Access Token");
            linkElement.setAttribute("class", "mapboxLink");
            linkElement.addEventListener("click", () => {
                this.host.launchUrl(url);
            });
            return linkElement;
        };

        private validateOptions(options: VisualUpdateOptions) {
            this.errorDiv.style.display = 'none';
            this.errorDiv.innerText = '';

            // Check for Access Token
            if (!this.settings.api.accessToken) {
                let link = this.createLinkElement("Mapbox", "https://mapbox.com/signup")
                let html = '<h4>Mapbox Access Token not set in options pane.</h4>';
                this.errorDiv.innerHTML = html;
                this.errorDiv.appendChild(link)
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

            if ((this.settings.circle.show || this.settings.cluster.show || this.settings.heatmap.show) && !(roles.latitude && roles.longitude)) {
                this.errorDiv.innerText = 'Longitude, Latitude fields required for circle, heatmap, and cluster visualizations.';
                return false;
            }
            else if (this.settings.choropleth.show && (!roles.location || !roles.category)) {
                this.errorDiv.innerText = 'Location, Color fields required for choropleth visualizations.'
                return false;
            }


            return true;
        }

        @mapboxUtils.logExceptions()
        public update(options: VisualUpdateOptions) {
            const dataView: DataView = options.dataViews[0];
            this.settings = MapboxSettings.parse<MapboxSettings>(dataView);
            
            if (!this.validateOptions(options)) {
                this.errorDiv.style.display = 'block';
                this.removeMap();
                return false;
            }

            if (!this.map) {
                this.addMap();
            }

            this.features = mapboxConverter.convert(dataView, this.host);
            if (this.settings.cluster.show) {
                this.cluster.load(this.features);
            }

            if (mapboxgl.accessToken != this.settings.api.accessToken) {
                mapboxgl.accessToken = this.settings.api.accessToken;
            }

            let styleChanged = false;
            let style = this.settings.api.style == 'custom' ? this.settings.api.styleUrl : this.settings.api.style;
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
                onUpdate(this.map, this.getFeatures(), this.settings, false, this.category);
            }
        }

        @mapboxUtils.logExceptions()
        public destroy(): void {
            this.removeMap();
        }
    }
}
