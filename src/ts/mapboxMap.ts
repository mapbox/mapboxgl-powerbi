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
                return this.roleMap.cluster.displayName;
            }))
            this.layers.push(new Circle(this, options.host.colorPalette))
            this.layers.push(new Choropleth(this))

        }

        onUpdate(map, settings, zoom, updatedHandler: Function) {
            try {
                this.layers.map( layer => {
                    layer.applySettings(settings, this.roleMap);
                });

                if (zoom) {
                    const bounds = this.layers.map( layer => {
                        return layer.getBounds(settings);
                    }).reduce( (acc, bounds) => {
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
                zoom: this.settings.api.zoom,
                center: [this.settings.api.startLong, this.settings.api.startLat],
                transformRequest: (url, resourceType) => {
                    if ( url.slice(0,22) == 'https://api.mapbox.com' ||
                        url.slice(0,26) == 'https://a.tiles.mapbox.com' ||
                        url.slice(0,26) == 'https://b.tiles.mapbox.com' ||
                        url.slice(0,26) == 'https://c.tiles.mapbox.com') {
                        //Add PowerBI Plugin identifier for Mapbox API traffic
                        return {
                           url: [url.slice(0, url.indexOf("?")+1), "pluginName=PowerBI&", url.slice(url.indexOf("?")+1)].join('')
                         }
                     }
                     else {
                         //Do not transform URL for non Mapbox GET requests
                         return {url: url}
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
            this.map.on('load', () => {
                this.onUpdate(this.map, this.settings, true, this.updatedHandler)
                this.addClick();
            });
            this.map.on('zoom', () => {
                const newZoom = Math.floor(this.map.getZoom())
                if (this.previousZoom != newZoom) {
                    this.previousZoom = newZoom;
                    this.layers.map( layer => {
                        layer.handleZoom(this.settings);
                        layer.applySettings(this.settings, this.roleMap);
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

        private addClick() {
            if (!this.map) { return }
            if (this.map.listens('click')) { return }
            const onClick = mapboxUtils.createClickHandler(this)
            this.map.on('click', onClick);
        }

        getExistingLayers(): Layer[] {
            return this.layers.filter(layer => layer.layerExists())
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

            if ((this.settings.circle.show || this.settings.cluster.show || this.settings.heatmap.show) && !(roles.latitude && roles.longitude)) {
                this.errorDiv.innerHTML = Templates.MissingGeo;
                return false;
            }
            else if (this.settings.choropleth.show && ((!roles.location || !roles.color) || (roles.latitude || roles.longitude || roles.size))) {

                this.errorDiv.innerHTML = Templates.MissingLocationOrColor;
                return false;
            }
            else if (this.settings.choropleth.show && (
                !this.settings.choropleth.vectorTileUrl ||
                !this.settings.choropleth.sourceLayer ||
                !this.settings.choropleth.vectorProperty)
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

        public hideTooltip(): void {
            this.tooltipServiceWrapper.hide(true)
        }

        public updateLayers(dataView : DataView) {
            // Placeholder to indicate whether data changed or paint prop changed
            // For now this is always true
            let dataChanged = true;
            const features = mapboxConverter.convert(dataView);
            let datasources :  Map<any, boolean> = new Map<any, boolean>()
            this.layers.map( layer => {
                const source = layer.getSource(this.settings);
                if (source) {
                    datasources.set(source, true)
                }
            })

            for (let datasource of datasources.keys()) {
                datasource.update(this.map, features, this.roleMap, this.settings);
            };


            // TODO has to do this async as choropleth datasource may not yet be added
            // and bounds are not filled
            //this.bounds = turf.bbox(turf.helpers.featureCollection(features));
            //this.bounds = this.layers.choropleth.getBounds(this.settings, this.bounds);
            //if (this.bounds && this.bounds.length > 0 && this.bounds[0] == null) {
            //this.bounds = null
            //}

            this.layers.map(layer => {
                if (layer.hasTooltip()) {
                    this.tooltipServiceWrapper.addTooltip(
                        this.map,
                        layer.getLayerIDs(),
                        (tooltipEvent: TooltipEventArgs<number>) => {
                            return layer.handleTooltip(tooltipEvent, this.roleMap, this.settings);
                        }
                    );
                }
            });

            this.onUpdate(this.map, this.settings, true, this.updatedHandler);
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
            if (this.mapStyle == '' || !this.map.isStyleLoaded() || this.mapStyle != style) {

                // This should run only once but it runs with different dataView
                // param every time so we need to set a different event handler on every
                // style change and deregister it when it ran.
                const delayedUpdate = (e) => {
                    this.updateLayers(dataView)
                    this.map.off('style.load', delayedUpdate);
                }
                this.map.on('style.load', delayedUpdate);
                if (this.mapStyle != style) {
                    this.mapStyle = style;
                    const ret = this.map.setStyle(this.mapStyle);
                }
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
