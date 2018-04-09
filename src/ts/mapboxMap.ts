module powerbi.extensibility.visual {
    declare var debug: any;
    declare var turf: any;

    class Features {
        rawData: any[] = null;
        choroplethData: any[] = null;
        clusterData: any[] = null;
        bounds: any[] = null;
    }

    class Layers {
        heatmap: Heatmap = null;
        cluster: Cluster = null;
        circle: Circle = null;
        choropleth: Choropleth = null;
    }

    export class MapboxMap implements IVisual {
        private map: mapboxgl.Map;
        private mapDiv: HTMLDivElement;
        private errorDiv: HTMLDivElement;
        private autoZoomControl: AutoZoomControl;
        private features: any[];
        private settings: MapboxSettings;
        private mapStyle: string = "";
        private updatedHandler: Function = () => { }
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private layers: Layers;
        private roleMap: any;
        private previousZoom: number;
        private firstSymbolId: string;

        constructor(options: VisualConstructorOptions) {
            // Map initialization
            this.previousZoom = 0;
            this.mapDiv = document.createElement('div');
            this.mapDiv.className = 'map';
            options.element.appendChild(this.mapDiv);
            this.errorDiv = document.createElement('div');
            this.errorDiv.className = 'error';
            options.element.appendChild(this.errorDiv);

            this.autoZoomControl = new AutoZoomControl();

            // For anchor elements to work we need to manually
            // call launchUrl API method
            options.element.addEventListener("click", (e) => {
                var link = <HTMLAnchorElement>e.target;
                if (link && link.className == 'mapboxLink' && link.href) {
                    e.preventDefault();
                    options.host.launchUrl(link.href);
                }
            });

            this.tooltipServiceWrapper = createTooltipServiceWrapper(options.host.tooltipService, options.element);

            this.layers = new Layers();
            this.layers.heatmap = new Heatmap(this);
            this.layers.cluster = new Cluster(this, () => {
                return this.roleMap.cluster
            });
            this.layers.circle = new Circle(this, options.host.colorPalette);
            this.layers.choropleth = new Choropleth(this);

        }

        onUpdate(map, features, settings, zoom, updatedHandler: Function) {
            try {
                if (!map.getSource('data')) {
                    return;
                }

                if (features.clusterData) {
                    let source: any = map.getSource('clusterData');
                    source.setData(turf.helpers.featureCollection(features.clusterData));
                }

                if (features.rawData) {
                    let source: any = map.getSource('data');
                    source.setData(turf.helpers.featureCollection(features.rawData));
                }

                this.layers.heatmap.applySettings(features, settings, this.roleMap);
                this.layers.cluster.applySettings(features, settings, this.roleMap);
                this.layers.circle.applySettings(features, settings, this.roleMap);
                this.layers.choropleth.applySettings(features, settings, this.roleMap);

                if (zoom) {
                    mapboxUtils.zoomToData(map, features, this.autoZoomControl.isPinned());
                }

                if (this.settings.api.extrudeBuildings) {
                    if (!this.map.getLayer('3d-buildings') && this.settings.api.style != 'custom') {
                        this.map.addLayer({
                            'id': '3d-buildings',
                            'source': 'composite',
                            'source-layer': 'building',
                            'filter': ['==', 'extrude', 'true'],
                            'type': 'fill-extrusion',
                            'minzoom': 15,
                            'paint': {
                                'fill-extrusion-color': '#aaa',
                                'fill-extrusion-height': [
                                    "interpolate", ["linear"], ["zoom"],
                                    15, 0,
                                    15.05, ["get", "height"]
                                ],
                                'fill-extrusion-base': [
                                    "interpolate", ["linear"], ["zoom"],
                                    15, 0,
                                    15.05, ["get", "min_height"]
                                ],
                                'fill-extrusion-opacity': .6
                            }
                        }, 'waterway-label');
                    }
                }
                else {
                    if (this.map.getLayer('3d-buildings')) {
                        this.map.removeLayer('3d-buildings')
                    }
                }
            } finally {
                updatedHandler();
            }
        }

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
            let ret: Features = new Features();

            if (this.features.length > 0 && this.features[0].geometry.coordinates[0] != null) {
                ret.rawData = this.features;
            }

            if (this.settings.cluster.show) {
                ret.clusterData = this.layers.cluster.getData(this.settings);
            }

            if (this.settings.choropleth.show) {
                ret.choroplethData = this.features.map(f => f.properties);
                const source: any = this.map.getSource('choropleth-source');
                if (source && source.tileBounds) {
                    ret.bounds = source.tileBounds.bounds
                }
            }

            return ret;
        }

        public on(event: string, fn: Function) {
            switch (event) {
                case 'updated': {
                    this.updatedHandler = fn;
                }
            }
        }

        public getMap() {
            return this.map;
        }

        private addMap() {
            if (this.map) {
                return
            }

            const mapOptions = {
                container: this.mapDiv,
                transformRequest: (url, resourceType) => {
                    return {
                        url: [url.slice(0, url.indexOf("?") + 1), "pluginName=PowerBI&", url.slice(url.indexOf("?") + 1)].join('')
                    }
                }
            }

            // If the map container doesn't exist yet, create it
            this.map = new mapboxgl.Map(mapOptions);
            this.map.addControl(new mapboxgl.NavigationControl());
            this.map.addControl(this.autoZoomControl);


            // Future option to enable search bar / geocoder
            /*if (document.getElementsByClassName('mapbox-gl-geocoder').length == 0) {
                this.map.addControl(new mapbox_geocoder({
                    accessToken: this.settings.api.accessToken,
                }), 'top-left');
            }*/

            this.map.on('style.load', (e) => {

                let style = e.target;

                // For default styles place data under waterway-label layer
                let firstSymbolId = 'waterway-label';

                if (this.settings.api.style == 'mapbox://styles/mapbox/satellite-v9?optimize=true' ||
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
                this.firstSymbolId = firstSymbolId;

                this.map.addSource('data', {
                    type: 'geojson',
                    data: turf.helpers.featureCollection([]),
                    buffer: 0
                });

                this.map.addSource('clusterData', {
                    type: 'geojson',
                    data: turf.helpers.featureCollection([]),
                    buffer: 0
                });

                this.layers.heatmap.addLayer(firstSymbolId)
                this.layers.cluster.addLayer(this.settings, firstSymbolId)
                this.layers.circle.addLayer(firstSymbolId);
                this.layers.choropleth.addLayer(firstSymbolId);

                this.onUpdate(this.map, this.getFeatures(), this.settings, false, this.updatedHandler)
            });

            this.map.on('load', () => {
                this.onUpdate(this.map, this.getFeatures(), this.settings, true, this.updatedHandler)
                mapboxUtils.addClick(this.map);
            });
            this.map.on('zoom', () => {
                if (this.previousZoom != Math.floor(this.map.getZoom())) {
                    this.previousZoom = Math.floor(this.map.getZoom());
                    if (this.settings.cluster.show) {
                        this.onUpdate(this.map, this.getFeatures(), this.settings, false, this.updatedHandler);
                    }
                }
            });
        }

        private removeMap() {
            if (this.map) {
                this.map.remove();
                this.map = null;
                this.mapStyle = "";
            }
        }

        private validateOptions(options: VisualUpdateOptions) {
            this.errorDiv.style.display = 'none';
            this.errorDiv.innerText = '';

            // Check for Access Token
            if (!this.settings.api.accessToken) {
                this.errorDiv.innerHTML = Templates.MissingToken;
                return false;
            }

            // Check for Location properties
            const roles: any = options.dataViews[0].metadata.columns.map(column => {
                if (column.roles) {
                    return Object.keys(column.roles);
                } else {
                    return null;
                }
            }).reduce((acc, curr) => {
                if (curr) {
                    curr.map(role => {
                        acc[role] = true;
                    });
                }
                return acc;
            }, {});

            if (!mapboxgl.supported()) {
                this.errorDiv.innerHTML = Templates.WebGLUnsupported;
                return false;
            }

            if ((this.settings.circle.show || this.settings.cluster.show || this.settings.heatmap.show) && !(roles.latitude && roles.longitude)) {
                this.errorDiv.innerHTML = Templates.MissingGeo;
                return false;
            }
            else if (this.settings.choropleth.show && ((!roles.location || !roles.color) || (roles.latitude || roles.longitude || roles.size))) {

                this.errorDiv.innerHTML = Templates.MissingLocationOrColor;
                return false;
            }
            else if (this.settings.cluster.show && !roles.cluster) {
                this.errorDiv.innerHTML = Templates.MissingCluster;
                return false;
            }

            return true;
        }

        private visibilityChanged(oldSettings, newSettings) {
            return oldSettings && newSettings && (
                oldSettings.choropleth.show != newSettings.choropleth.show ||
                oldSettings.circle.show != newSettings.circle.show ||
                oldSettings.cluster.show != newSettings.cluster.show ||
                oldSettings.heatmap.show != newSettings.heatmap.show)
        }

        private static getTooltipData(value: any): VisualTooltipDataItem[] {
            if (!value) {
                return []
            }

            // Flatten the multiple properties or multiple datapoints
            return [].concat.apply([], value.map(properties => {
                // This mapping is needed to copy the value with the toString
                // call as otherwise some caching logic causes to be the same
                // tooltip displayed for all datapoints.
                return properties.map(prop => {
                    return {
                        displayName: prop.key,
                        value: prop.value.toString(),
                    }
                });
            }))
        }

        @mapboxUtils.logExceptions()
        public update(options: VisualUpdateOptions) {
            const dataView: DataView = options.dataViews[0];

            this.roleMap = mapboxUtils.getRoleMap(dataView.metadata);

            const oldSettings = this.settings;
            this.settings = MapboxSettings.parse<MapboxSettings>(dataView);
            const layerVisibilityChanged = this.visibilityChanged(oldSettings, this.settings);

            if (!this.validateOptions(options)) {
                this.errorDiv.style.display = 'block';
                this.removeMap();
                return false;
            }

            if (!this.map) {
                this.addMap();
            }

            // Placeholder to indicate whether data changed or paint prop changed
            // For now this is always true
            let dataChanged = true;
            this.features = mapboxConverter.convert(dataView);


            if (this.settings.cluster.show) {
                this.layers.cluster.update(this.features);
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
            this.layers.circle.updateColorColumn(dataView.table.columns);
            this.layers.choropleth.updateColorColumn(dataView.table.columns);

            this.tooltipServiceWrapper.addTooltip(this.map,
                ['circle', 'cluster', 'uncluster'],
                (tooltipEvent: TooltipEventArgs<number>) => {
                    const tooltipData = MapboxMap.getTooltipData(tooltipEvent.data)
                    return tooltipData;
                }
            );

            // If the map is loaded and style has not changed in this update
            // then we should update right now.
            if (!styleChanged) {
                this.onUpdate(this.map, this.getFeatures(), this.settings, dataChanged || layerVisibilityChanged, this.updatedHandler);
            }
        }

        @mapboxUtils.logExceptions()
        public destroy(): void {
            this.removeMap();
        }
    }
}
