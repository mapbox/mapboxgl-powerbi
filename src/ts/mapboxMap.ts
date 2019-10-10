module powerbi.extensibility.visual {
    declare var turf: any;

    export class MapboxMap implements IVisual {
        private map: mapboxgl.Map;
        private mapDiv: HTMLDivElement;
        private errorDiv: HTMLDivElement;
        private controlsPopulated: boolean;
        private navigationControl: mapboxgl.NavigationControl;
        private autoZoomControl: AutoZoomControl;
        private legend: LegendControl;
        private settings: MapboxSettings;
        private mapStyle: string = "";
        private updatedHandler: Function = () => { }
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private layers: Layer[] = [];
        private roleMap: any;
        private previousZoom: number;
        private filter: Filter;
        private palette: Palette;

        private host: IVisualHost;
        private drawControl: DrawControl;
        private geocoder: MapboxGeocoderControl;

        constructor(options: VisualConstructorOptions) {
            // Map initialization
            this.previousZoom = 0;
            this.mapDiv = document.createElement('div');
            this.mapDiv.className = 'map';
            options.element.appendChild(this.mapDiv);
            this.errorDiv = document.createElement('div');
            this.errorDiv.className = 'error';
            options.element.appendChild(this.errorDiv);

            // For anchor elements to work we need to manually
            // call launchUrl API method
            options.element.addEventListener("click", (e) => {
                let link = <HTMLAnchorElement>e.target;
                if (link && link.className == 'mapboxLink' && link.href) {
                    e.preventDefault();
                    options.host.launchUrl(link.href);
                }
            });

            this.host = options.host;

            this.tooltipServiceWrapper = createTooltipServiceWrapper(options.host.tooltipService, options.element);
            this.filter = new Filter(this, options.host)
            this.palette = new Palette(this, options.host)

            this.navigationControl = new mapboxgl.NavigationControl();
            this.autoZoomControl = new AutoZoomControl(this.host);
            this.drawControl = new DrawControl(this.filter)
            this.controlsPopulated = false;
        }

        onUpdate(map, settings, updatedHandler: Function) {
            try {
                this.layers.map(layer => {
                    layer.applySettings(settings, this.roleMap);
                });

                this.updateLegend(settings)

                if (settings.api.autozoom) {
                    const bounds = this.layers.map(layer => {
                        return layer.getBounds(settings);
                    }).reduce((acc, bounds) => {
                        if (!bounds) {
                            return acc;
                        }
                        if (!acc) {
                            return bounds
                        }
                        const combined = turf.helpers.featureCollection([
                            turf.bboxPolygon(acc),
                            turf.bboxPolygon(bounds)
                        ]);
                        return turf.bbox(combined)
                    });
                    mapboxUtils.zoomToData(map, bounds);
                }
            }
            catch (error) {
                console.error("OnUpdate failed:", error)
            }
            finally {
                updatedHandler();
            }
        }

        /**
        * This function returns the values to be displayed in the property pane for each object.
        * Usually it is a bind pass of what the property pane gave you, but sometimes you may want to do
        * validation and return other values/defaults
        */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            if (options.objectName == 'dataColorsPalette') {
                return this.palette.enumerateObjectInstances(options);
            } else {
                return MapboxSettings.enumerateObjectInstances(this.settings || MapboxSettings.getDefault(), options);
            }
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

        public getMapDiv() {
            return this.mapDiv;
        }

        public getRoleMap() {
            return this.roleMap;
        }

        private addMap() {
            if (this.map) {
                return
            }

            const mapOptions = {
                container: this.mapDiv,
                zoom: this.settings.api.zoom,
                center: [this.settings.api.startLong, this.settings.api.startLat],
                transformRequest: (url, resourceType) => {
                    if (url.slice(0, 25) == 'https://api.mapbox.com/v4' ||
                        url.slice(0, 26) == 'https://a.tiles.mapbox.com' ||
                        url.slice(0, 26) == 'https://b.tiles.mapbox.com' ||
                        url.slice(0, 26) == 'https://c.tiles.mapbox.com' ||
                        url.slice(0, 26) == 'https://d.tiles.mapbox.com') {
                        // Add PowerBI Plugin identifier for Mapbox API traffic
                        return {
                            url: [url.slice(0, url.indexOf("?") + 1), "pluginName=PowerBI&", url.slice(url.indexOf("?") + 1)].join('')
                        }
                    }
                    else {
                        // Do not transform URL for non Mapbox GET requests
                        return { url: url }
                    }
                }
            }

            // If the map container doesn't exist yet, create it
            this.map = new mapboxgl.Map(mapOptions);

            this.layers = [];
            this.layers.push(new Raster(this));
            this.layers.push(new Heatmap(this));
            this.layers.push(new Cluster(this, () => {
                return this.roleMap.cluster.displayName;
            }))
            this.layers.push(new Circle(this, this.filter, this.palette));
            this.layers.push(new Choropleth(this, this.filter, this.palette));
            mapboxgl.config.API_URL = this.settings.api.apiUrl;


            this.filter.manageHandlers();
            this.drawControl.manageHandlers(this);

            this.map.on('zoom', () => {
                const newZoom = Math.floor(this.map.getZoom())
                if (this.previousZoom != newZoom) {
                    this.previousZoom = newZoom;
                    this.layers.map(layer => {
                        if (layer.handleZoom(this.settings)) {
                            layer.applySettings(this.settings, this.roleMap);
                        }
                    });
                    this.updateLegend(this.settings);
                }
            });
        }

        private removeMap() {
            if (this.map) {
                this.map.remove();
                this.map = null;
                this.mapStyle = "";
                this.layers = []
            }
        }

        getExistingLayers(): Layer[] {
            return this.layers.filter(layer => layer.layerExists())
        }

        private validateOptions(options: VisualUpdateOptions) {

            // Hide div and remove any child elements
            this.errorDiv.setAttribute("style", "display: none;");
            while (this.errorDiv.hasChildNodes()) { 
                this.errorDiv.removeChild(this.errorDiv.firstChild) 
            }

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

            if ((this.settings.circle.show || this.settings.cluster.show || this.settings.heatmap.show) && (!(roles.latitude && roles.longitude))) {
                this.errorDiv.innerHTML = Templates.MissingGeo;
                return false;
            }
            else if (this.settings.choropleth.show && ((!roles.location || !roles.color) || (roles.latitude || roles.longitude))) {
                this.errorDiv.innerHTML = Templates.MissingLocationOrColor;
                return false;
            }
            else if (this.settings.choropleth.show && (
                !this.settings.choropleth.vectorTileUrl1 ||
                !this.settings.choropleth.sourceLayer1 ||
                !this.settings.choropleth.vectorProperty1)
            ) {
                this.errorDiv.innerHTML = Templates.MissingChoroplethSettings;
                return false;
            }
            else if (this.settings.cluster.show && !roles.cluster) {
                this.errorDiv.innerHTML = Templates.MissingCluster;
                return false;
            }

            return true;
        }

        private manageControlElements() {
            if (this.settings.api.mapboxControls) {
                if (!this.controlsPopulated) {
                    this.map.addControl(this.navigationControl);
                    this.map.addControl(this.drawControl);
                    this.map.addControl(this.autoZoomControl);
                    this.controlsPopulated = true;
                }
            } else {
                if (this.controlsPopulated) {
                    this.map.removeControl(this.navigationControl);
                    this.map.removeControl(this.drawControl);
                    this.map.removeControl(this.autoZoomControl);
                    this.controlsPopulated = false;
                }
            }
        }

        public hideTooltip(): void {
            this.tooltipServiceWrapper.hide(true)
        }

        public updateLayers(dataView: DataView) {
            const features = mapboxConverter.convert(dataView);

            this.palette.update(dataView, features);

            let datasources = {}
            this.layers.map(layer => {
                const source = layer.getSource(this.settings);
                if (source) {
                    datasources[source.ID] = source;
                }
            })

            for (let id in datasources) {
                let datasource = datasources[id];
                datasource.update(this.map, features, this.roleMap, this.settings);
            };

            this.layers.map(layer => {
                this.tooltipServiceWrapper.addTooltip(
                    this.map,
                    layer,
                    () => this.roleMap.tooltips,
                    (tooltipEvent: TooltipEventArgs<number>) => {
                        return layer.handleTooltip(tooltipEvent, this.roleMap, this.settings);
                    }
                );
            });

            this.onUpdate(this.map, this.settings, this.updatedHandler);
        }

        private updateCurrentLevel(settings, options) {
            let temp = options.dataViews[0].metadata.columns;
            let temp_indexes = []
            let temp_ii = []
            temp.map((v, i) => {
                if (v.roles['location']) {
                    temp_indexes.push(v.displayName)
                    temp_ii.push(i)
                }
            })

            let temp_sources = options.dataViews[0].matrix.rows.levels[0].sources.filter(s => temp_indexes.indexOf(s.identityExprs[0]['ref']) > -1)
            if (temp_sources.length < 1) {
                return;
            }

            if (temp_sources.length > 1) {
                settings.currentLevel = temp_sources.length
            } else {
                settings.currentLevel = temp_sources[0].index - temp_ii[0] + 1
            }
        }

        @mapboxUtils.logExceptions()
        public update(options: VisualUpdateOptions) {
            const dataView: DataView = options.dataViews[0];

            if (!dataView) {
                console.error('No dataView received from powerBI api')
                console.log('update options:', options)
                return
            }

            this.settings = MapboxSettings.parse<MapboxSettings>(dataView);

            if (!this.validateOptions(options)) {
                this.errorDiv.style.display = 'block';
                this.removeMap();
                return false;
            }

            this.filter.setCategories(dataView.categorical.categories);

            this.roleMap = mapboxUtils.getRoleMap(dataView.metadata);

            this.updateCurrentLevel(this.settings.choropleth, options);


            if (!this.map) {
                this.addMap();
            }

            // Show/hide Mapbox control elements based on the Mapbox Controls toggle button
            this.manageControlElements();

            this.updateGeocoder();

            // Apply auto-zoom pin state from settings, if they differ (note that one is referring to pin state,
            // the other is referring to 'enabled' state, this is why we have the equality check and the negation)
            if (this.autoZoomControl.isPinned() == this.settings.api.autozoom) {
                this.autoZoomControl.setPin(!this.settings.api.autozoom);
            }

            if (mapboxgl.accessToken != this.settings.api.accessToken) {
                mapboxgl.accessToken = this.settings.api.accessToken;
            }


            let style = this.settings.api.style == 'custom' ? this.settings.api.styleUrl : this.settings.api.style;
            if (this.mapStyle == '' || this.mapStyle != style) {

                // This should run only once but it runs with different dataView
                // param every time so we need to set a different event handler on every
                // style change and deregister it when it ran.
                const delayedUpdate = (e) => {
                    this.updateLayers(dataView);
                    this.map.off('style.load', delayedUpdate);
                }
                this.map.on('style.load', delayedUpdate);
                if (this.mapStyle != style) {
                    this.mapStyle = style;
                    this.map.setStyle(this.mapStyle);
                }
            } else {
                this.updateLayers(dataView)
                return;
            }
        }

        private updateGeocoder() {
            if (this.settings.geocoder.show && !this.geocoder) {
                this.geocoder = new MapboxGeocoderControl(this.settings);
                this.map.addControl(this.geocoder);
            }
            else if (!this.settings.geocoder.show && this.geocoder) {
                this.map.removeControl(this.geocoder)
                this.geocoder = null
            }

            if (this.geocoder) {
                this.geocoder.update(this.map, this.settings)
            }
        }

        private updateLegend(settings: MapboxSettings) {
            if (this.legend) {
                this.legend.removeLegends()
            }

            if (!this.roleMap)
            {
                if (this.legend) {
                    this.map.removeControl(this.legend)
                    this.legend = null
                }

                return
            }

            // If no legend is added to legendControl remove
            // legendControl at the end of the update
            let removeLegend = true;
            this.layers.forEach(layer => {
                if (!layer.showLegend(settings, this.roleMap)) {
                    return
                }

                if (!this.legend) {
                    this.legend = new LegendControl()
                    this.map.addControl(this.legend)
                }
                layer.addLegend(this.legend, this.roleMap, settings);

                // Legend is added to legendControl
                removeLegend = false
            });

            if (removeLegend && this.legend) {
                this.map.removeControl(this.legend)
                this.legend = null
            }
        }

        @mapboxUtils.logExceptions()
        public destroy(): void {
            this.removeMap();
        }

        public getSettings() {
            return this.settings
        }
    }
}
