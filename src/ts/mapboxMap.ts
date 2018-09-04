module powerbi.extensibility.visual {
    declare var turf: any;
    declare var MapboxDraw : any;

    export class MapboxMap implements IVisual {
        private map: mapboxgl.Map;
        private mapDiv: HTMLDivElement;
        private errorDiv: HTMLDivElement;
        private controlsPopulated: boolean;
        private navigationControl: mapboxgl.NavigationControl;
        private autoZoomControl: AutoZoomControl;
        private settings: MapboxSettings;
        private mapStyle: string = "";
        private updatedHandler: Function = () => { }
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private selectionManager: ISelectionManager;
        private layers: Layer[] = [];
        private roleMap: any;
        private previousZoom: number;
        private filter: Filter;
        private palette: Palette;

        private host: IVisualHost;
        private categories: any;
        private draw: any;  // TODO: this should not be any

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
            this.selectionManager = options.host.createSelectionManager();
            this.filter = new Filter(this)
            this.palette = new Palette(this, options.host)

            this.navigationControl = new mapboxgl.NavigationControl();
            this.autoZoomControl = new AutoZoomControl(this.host);

            // Override the line string tool with our lasso draw tool
            MapboxDraw.modes.draw_line_string = LassoDraw.create(this.filter);

            this.draw = new MapboxDraw({
                displayControlsDefault: false,
                // defaultMode: 'lasso',
                controls: {
                    'polygon': true,
                    'line_string': true     // Lasso is overriding the 'line_string' mode
                },
            });

            this.controlsPopulated = false;
        }

        onUpdate(map, settings, updatedHandler: Function) {
            try {
                this.layers.map(layer => {
                    layer.applySettings(settings, this.roleMap);
                });

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
            if (options.objectName == 'colorSelector') {
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

        public clearSelection() {
            this.selectionManager.clear();
        }

        public addSelection(values, role?) {
            let indexes = values;
            let category = this.categories[0];

            if (role) {
                category = this.categories.filter( cat => {
                    return cat.source.displayName == role.displayName;
                })[0]

                console.log(category);

                indexes = values.map( value => category.values.indexOf(value));
            }

            const selectors = indexes
                .filter( index => {
                    return (index >= 0 && index < category.values.length)
                })
                .map( index => {
                    return this.host.createSelectionIdBuilder()
                        .withCategory(category, index).createSelectionId();
                })

            this.selectionManager.select(selectors, false);
        }

        public hasSelection() {
            return this.selectionManager.hasSelection();
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
                    if (url.slice(0, 22) == 'https://api.mapbox.com' ||
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

            this.layers = []
            this.layers.push(new Heatmap(this))
            this.layers.push(new Cluster(this, () => {
                return this.roleMap.cluster.displayName;
            }))
            this.layers.push(new Circle(this, this.palette))
            this.layers.push(new Choropleth(this, this.palette));
            mapboxgl.config.API_URL = this.settings.api.apiUrl;

            // Replace the line string draw icon to the lasso icon
            LassoDraw.makeIcon();

            this.filter.manageHandlers();

            this.map.on('zoom', () => {
                const newZoom = Math.floor(this.map.getZoom())
                if (this.previousZoom != newZoom) {
                    this.previousZoom = newZoom;
                    this.layers.map(layer => {
                        if (layer.handleZoom(this.settings)) {
                            layer.applySettings(this.settings, this.roleMap);
                        }
                    });
                }
            });

            this.map.on('draw.create', (e) => {

                this.map.doubleClickZoom.disable();

                // Get the feature the user has drawn
                const selection_poly = e.features[0];

                const selectFeature = function(sel_pol, feature) {
                    if (feature.geometry.type === 'Point' && turf.booleanContains(sel_pol, feature)) {
                        return true;
                    }
                    if ((feature.geometry.type === 'Polygon' || feature.geometry.type === 'Linestring') &&
                       (turf.booleanOverlap(feature, sel_pol) || turf.booleanContains(sel_pol, feature) ||
                        turf.booleanContains(feature, sel_pol)
                    )) {
                        return true;
                    }

                    return false;
                }

                // Create a bounding box from the user's polygon
                const polygonBoundingBox = turf.bbox(selection_poly);
                const southWest = this.map.project([polygonBoundingBox[0], polygonBoundingBox[1]]);
                const northEast = this.map.project([polygonBoundingBox[2], polygonBoundingBox[3]]);

                // Find features in a layer the user selected bbox
                const layers = this.getExistingLayers();
                const layerIDs = layers.map(layer => layer.getId());
                const bbox_features : any[] = this.map.queryRenderedFeatures([southWest, northEast], {
                    layers: layerIDs
                });

                let selectedFeatures = bbox_features.reduce(function (acc, feature) {
                    if (selectFeature(selection_poly, feature)) {
                        acc.push(feature);
                        return acc;
                    }

                    // Split the feature into polygons, if it is a MultiPolygon
                    if (feature.geometry.type === 'MultiPolygon') {
                        for (let polygon of feature.geometry.coordinates) {
                            if (selectFeature(selection_poly, turf.helpers.polygon(polygon))) {
                                acc.push(feature);
                                return acc;
                            }
                        };
                    }

                    return acc;
                }, []);

                // Here are the selected features we can use for filters, selects, etc
                if (layers && layers.length > 0) {
                    const roleMap = this.getRoleMap();
                    if (selectedFeatures.length > constants.MAX_SELECTION_COUNT) {
                        selectedFeatures = selectedFeatures.slice(0, constants.MAX_SELECTION_COUNT);
                    }
                    layers.map( layer => {
                        layer.updateSelection(
                            selectedFeatures,
                            roleMap);
                    })
                }

                // Remove all features from the map after selection
                this.draw.deleteAll();
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
                    this.map.addControl(this.draw, 'top-left');
                    this.map.addControl(this.autoZoomControl);
                    this.controlsPopulated = true;
                }
            } else {
                if (this.controlsPopulated) {
                    this.map.removeControl(this.navigationControl);
                    this.map.removeControl(this.draw);
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

            this.onUpdate(this.map, this.settings, this.updatedHandler);
        }

        private updateCurrentLevel(settings, options) {
            let temp = options.dataViews[0].metadata.columns;
            let temp_indexes = []
            let temp_ii = []
            temp.map( (v, i) => {
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

            this.categories = dataView.categorical.categories;

            this.roleMap = mapboxUtils.getRoleMap(dataView.metadata);

            this.updateCurrentLevel(this.settings.choropleth, options);


            if (!this.map) {
                this.addMap();
            }

            // Show/hide Mapbox control elements based on the Mapbox Controls toggle button
            this.manageControlElements();

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

        @mapboxUtils.logExceptions()
        public destroy(): void {
            this.removeMap();
        }

        public getSettings() {
            return this.settings
        }
    }
}
