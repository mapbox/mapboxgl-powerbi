module powerbi.extensibility.visual {
    declare var debug: any;
    declare var turf: any;

    export class MapboxMap implements IVisual {
        private map: mapboxgl.Map;
        private mapDiv: HTMLDivElement;
        private errorDiv: HTMLDivElement;
        private autoZoomControl: AutoZoomControl;
        private bounds: any[] = null;
        private settings: MapboxSettings;
        private mapStyle: string = "";
        private updatedHandler: Function = () => { }
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private layers: Layer[] = [];
        private roleMap: any;
        private previousZoom: number;

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

            this.layers = []
            this.layers.push(new Heatmap(this))
            this.layers.push(new Cluster(this, () => {
                return this.roleMap.cluster
            }))
            this.layers.push(new Circle(this, options.host.colorPalette))
            this.layers.push(new Choropleth(this))

        }

        onUpdate(map, settings, zoom, updatedHandler: Function) {
            try {
                if (!map.getSource('data')) {
                    return;
                }

                this.layers.map( layer => {
                    layer.applySettings(settings, this.roleMap);
                });

                if (zoom) {
                    const bounds = this.layers.map( layer => {
                        return layer.getBounds();
                    }).reduce( (acc, bounds) => {
                        if (!bounds) {
                            return acc;
                        }
                        const combined = turf.helpers.featureCollection([
                            turf.bboxPolygon(acc),
                            turf.bboxPolygon(bounds)
                        ]);
                        return turf.bbox(combined)
                    });
                    mapboxUtils.zoomToData(map, bounds, this.autoZoomControl.isPinned());
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

                this.layers.map( layer => {
                    layer.addLayer(this.settings, firstSymbolId);
                });
            });

            this.map.on('load', () => {
                this.onUpdate(this.map, this.settings, true, this.updatedHandler)
                mapboxUtils.addClick(this.map);
            });
            this.map.on('zoom', () => {
                if (this.previousZoom != Math.floor(this.map.getZoom())) {
                    this.previousZoom = Math.floor(this.map.getZoom());
                    this.layers.map( layer => {
                        layer.handleZoom(this.settings);
                    });
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

        public updateLayers(dataView : DataView) {
            // Placeholder to indicate whether data changed or paint prop changed
            // For now this is always true
            let dataChanged = true;
            const features = mapboxConverter.convert(dataView);
            this.layers.map( layer => {
                layer.updateSource(features, this.roleMap, this.settings);
            });

            // TODO has to do this async as choropleth datasource may not yet be added
            // and bounds are not filled
            //this.bounds = turf.bbox(turf.helpers.featureCollection(features));
            //this.bounds = this.layers.choropleth.getBounds(this.settings, this.bounds);
            //if (this.bounds && this.bounds.length > 0 && this.bounds[0] == null) {
            //this.bounds = null
            //}

            this.tooltipServiceWrapper.addTooltip(this.map,
                ['circle', 'cluster', 'uncluster'],
                (tooltipEvent: TooltipEventArgs<number>) => {
                    const tooltipData = MapboxMap.getTooltipData(tooltipEvent.data)
                    return tooltipData;
                }
            );

            this.onUpdate(this.map, this.settings, false, this.updatedHandler);
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

            if (mapboxgl.accessToken != this.settings.api.accessToken) {
                mapboxgl.accessToken = this.settings.api.accessToken;
            }


            let style = this.settings.api.style == 'custom' ? this.settings.api.styleUrl : this.settings.api.style;
            if (this.mapStyle != style) {
                this.mapStyle = style;
                const delayedUpdate = (e) => {
                    this.updateLayers(dataView)
                    this.map.off('style.load', delayedUpdate);
                }
                this.map.on('style.load', delayedUpdate);
                const ret = this.map.setStyle(this.mapStyle);
            } else {
                this.updateLayers(dataView)
                return;
            }
        }

        @mapboxUtils.logExceptions()
        public destroy(): void {
            this.removeMap();
        }
    }
}
