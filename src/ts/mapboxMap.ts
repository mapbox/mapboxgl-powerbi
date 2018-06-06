module powerbi.extensibility.visual {
    declare var debug: any;
    declare var turf: any;
    declare var MapboxDraw : any;
    declare var FreeDraw: any;

    export class MapboxMap implements IVisual {
        private map: mapboxgl.Map;
        private mapDiv: HTMLDivElement;
        private errorDiv: HTMLDivElement;
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
        private category: any;
        private draw: any;

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
                let link = <HTMLAnchorElement>e.target;
                if (link && link.className == 'mapboxLink' && link.href) {
                    e.preventDefault();
                    options.host.launchUrl(link.href);
                }
            });

            this.host = options.host;

            this.tooltipServiceWrapper = createTooltipServiceWrapper(options.host.tooltipService, options.element);
            this.selectionManager = options.host.createSelectionManager();
            this.host = options.host;
            this.filter = new Filter(this)
            this.palette = new Palette(this, options.host)
        }

        onUpdate(map, settings, zoom, updatedHandler: Function) {
            try {
                this.layers.map(layer => {
                    layer.applySettings(settings, this.roleMap);
                });

                if (zoom) {
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
                    mapboxUtils.zoomToData(map, bounds, this.autoZoomControl.isPinned());
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

        public addSelection(value, search: boolean) {
            let index = value;
            if (search) {
                index = this.category.values.indexOf(value);
            }
            if (index >= 0 && index < this.category.values.length) {
                let selector = this.host.createSelectionIdBuilder()
                    .withCategory(this.category, index).createSelectionId();
                this.selectionManager.select(selector, true);
            }
        }

        public hasSelection() {
            return this.selectionManager.hasSelection();
        }

        private addMap() {
            if (this.map) {
                return
            }

            this.layers = []
            this.layers.push(new Heatmap(this))
            this.layers.push(new Cluster(this, () => {
                return this.roleMap.cluster.displayName;
            }))
            this.layers.push(new Circle(this, this.palette))
            this.layers.push(new Choropleth(this, this.palette));

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

            let lassoMode : any = {};
            lassoMode.onSetup = function(opts) {
                let state : any = {};
                state.count = opts.count || 0;
                state.toggled = false;
                return state;
            }

            lassoMode.onClick = function(state, e) {
                state.toggled = !state.toggled;
                console.log('lasso mode is', state.toggled)
            };

            // Whenever a user clicks on a key while focused on the map, it will be sent here
            lassoMode.onKeyUp = function(state, e) {
                if (e.keyCode === 27) return this.changeMode('simple_select');
            };

            // This is the only required function for a mode.
            // It decides which features currently in Draw's data store will be rendered on the map.
            // All features passed to `display` will be rendered, so you can pass multiple display features per internal feature.
            // See `styling-draw` in `API.md` for advice on making display features
            lassoMode.toDisplayFeatures = function(state, geojson, display) {
                display(geojson);
            };

            lassoMode.onMouseMove = function(state, e) {
                if (state.toggled) {
                    // `this.newFeature` takes geojson and makes a DrawFeature
                    let point = this.newFeature({
                        type: 'Feature',
                        properties: {
                          count: state.count
                        },
                        geometry: {
                          type: 'Point',
                          coordinates: [e.lngLat.lng, e.lngLat.lat]
                        }
                      });
                      this.addFeature(point); // puts the point on the map
                }
            }

            // import doubleClickZoom from '@mapbox/mapbox-gl-draw/src/lib/double_click_zoom';
            // import Constants from '@mapbox/mapbox-gl-draw/src/constants';
            // import DrawPolygon from '@mapbox/mapbox-gl-draw/src/modes/draw_polygon';
            // import dragPan from '../src/lib/drag_pan';
            // import simplify from "@turf/simplify";

            console.log('MapboxDraw', MapboxDraw)
            // let Constants = MapboxDraw.constants;
            // console.log('constants', Constants)
            console.log('modes', MapboxDraw.modes)
            const FreeDraw = MapboxDraw.modes.draw_polygon;

            FreeDraw.onSetup = function() {
                const polygon = this.newFeature({
                    type: MapboxDrawConstants.geojsonTypes.FEATURE,
                    properties: {},
                    geometry: {
                        type: MapboxDrawConstants.geojsonTypes.POLYGON,
                        coordinates: [[]]
                    }
                });

                this.addFeature(polygon);

                this.clearSelectedFeatures();
                // doubleClickZoom.disable(this);
                // dragPan.disable(this);
                this.updateUIClasses({ mouse: MapboxDrawConstants.cursors.ADD });
                this.activateUIButton(MapboxDrawConstants.types.POLYGON);
                this.setActionableState({
                    trash: true
                });

                return {
                    polygon,
                    currentVertexPosition: 0,
                    dragMoving: false,
                    toggled: false,
                };
            };

            FreeDraw.onClick = function(state, e) {
                state.toggled = !state.toggled;
                console.log('lasso mode', state.toggled);
                if (!state.toggled) {
                    console.log('zoom value', this.map.getZoom())
                    const factor = Math.min(Math.floor(this.map.getZoom()), 4);
                    const tolerance = (3 / ((this.map.getZoom() - factor) * 150)) - 0.001 // https://www.desmos.com/calculator/b3zi8jqskw
                    console.log('tolerance', tolerance)
                    turf.simplify(state.polygon, {
                        mutate: true,
                        tolerance: tolerance,
                        highQuality: true
                    });

                    this.fireUpdate();
                    this.changeMode(MapboxDrawConstants.modes.SIMPLE_SELECT, { featureIds: [state.polygon.id] });
                }
            }

            FreeDraw.onMouseMove = FreeDraw.onTouchMove = function (state, e){
                state.dragMoving = true;
                if (state.toggled) {
                    this.updateUIClasses({ mouse: MapboxDrawConstants.cursors.ADD });
                    state.polygon.updateCoordinate(`0.${state.currentVertexPosition}`, e.lngLat.lng, e.lngLat.lat);
                    state.currentVertexPosition++;
                    state.polygon.updateCoordinate(`0.${state.currentVertexPosition}`, e.lngLat.lng, e.lngLat.lat);
                }
            }

            // FreeDraw.onMouseUp = function (state, e){
            //     if (state.dragMoving) {
            //         var tolerance = (3 / ((this.map.getZoom()-4) * 150)) - 0.001 // https://www.desmos.com/calculator/b3zi8jqskw
            //         turf.simplify(state.polygon, {
            //             mutate: true,
            //             tolerance: tolerance,
            //             highQuality: true
            //         });

            //         this.fireUpdate();
            //         this.changeMode(MapboxDrawConstants.modes.SIMPLE_SELECT, { featureIds: [state.polygon.id] });
            //     }
            // }

            FreeDraw.fireUpdate = function() {
                this.map.fire(MapboxDrawConstants.events.UPDATE, {
                    action: MapboxDrawConstants.updateActions.MOVE,
                    features: this.getSelected().map(f => f.toGeoJSON())
                });
            };

            MapboxDraw.modes.draw_polygon = FreeDraw;

            this.draw = new MapboxDraw({
                displayControlsDefault: false,
                // defaultMode: 'lasso',
                controls: {
                    'polygon': true
                },
                // modes: Object.assign({
                //     lasso: lassoMode,
                // }, MapboxDraw.modes)
            });
            this.map.addControl(new mapboxgl.NavigationControl());
            this.map.addControl(this.draw, 'top-left');
            this.map.addControl(this.autoZoomControl);

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

                // Get the feature the user has drawn
                let selection_poly = e.features[0];
                console.log('selection poly', selection_poly);
                let selectedFeatures : any[] = [];

                // Create a bounding box from the user's polygon
                var polygonBoundingBox = turf.bbox(selection_poly);
                var southWest = this.map.project([polygonBoundingBox[0], polygonBoundingBox[1]]);
                var northEast = this.map.project([polygonBoundingBox[2], polygonBoundingBox[3]]);

                // Find features in a layer the user selected bbox
                var bbox_features : any[] = this.map.queryRenderedFeatures([southWest, northEast], { 
                    layers: ['choropleth'] //Update to use layers in user's map, tested with circle and choropleth
                });

                // Use turf.intersect to find features in the selection_polygon from the bbox query
                bbox_features.reduce(function (bbox_features, feature) {
                    if (feature.geometry.type === 'Point' && turf.booleanContains(selection_poly, feature)) {
                        selectedFeatures.push(feature)
                    }
                    if ((feature.geometry.type === 'Polygon' || feature.geometry.type === 'Linestring') &&
                       (turf.booleanOverlap(feature, selection_poly) || turf.booleanContains(selection_poly, feature))) {
                        selectedFeatures.push(feature)
                    }
                });

                // Here are the selected features we can use for filters, selects, etc
                console.log(selectedFeatures);

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
            else if (this.settings.choropleth.show && ((!roles.location || !roles.color) || (roles.latitude || roles.longitude || roles.size))) {
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

        public updateLayers(dataView: DataView) {
            // Placeholder to indicate whether data changed or paint prop changed
            // For now this is always true
            const features = mapboxConverter.convert(dataView);

            this.palette.update(dataView, features);

            let datasources: Map<any, boolean> = new Map<any, boolean>()
            this.layers.map(layer => {
                const source = layer.getSource(this.settings);
                if (source) {
                    datasources.set(source, true)
                }
            })

            for (let datasource of datasources.keys()) {
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

            this.onUpdate(this.map, this.settings, true, this.updatedHandler);
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

            this.category = dataView.categorical.categories[0];

            this.roleMap = mapboxUtils.getRoleMap(dataView.metadata);

            this.settings = MapboxSettings.parse<MapboxSettings>(dataView);

            this.updateCurrentLevel(this.settings.choropleth, options);

            if (!this.validateOptions(options)) {
                this.errorDiv.style.display = 'block';
                this.removeMap();
                return false;
            }

            if (!this.map) {
                this.addMap();
            }

            if (this.autoZoomControl.isPinned() == this.settings.api.autozoom) {
                this.autoZoomControl.setPin(!this.settings.api.autozoom);
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
                    this.updateLayers(dataView);
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

        public getSettings() {
            return this.settings
        }
    }
}
