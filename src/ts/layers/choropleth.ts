module powerbi.extensibility.visual {

    export class Choropleth extends Layer {
        public static readonly ID = 'choropleth'
        public static readonly OutlineID = 'choropleth-outline'
        public static readonly HighlightID = 'choropleth-highlight'
        public static readonly HighlightOutlineID = 'choropleth-highlight-outline'
        public static readonly ExtrusionID = 'choropleth-extrusion'
        public static readonly ExtrusionHighlightID = 'choropleth-extrusion-highlight'

        private static HeightMultiplier = 100

        private filter: Filter;
        private palette: Palette;
        private settings: ChoroplethSettings;

        constructor(map: MapboxMap, filter: Filter, palette: Palette) {
            super(map);
            this.id = Choropleth.ID;
            this.source = data.Sources.Choropleth;
            this.filter = filter;
            this.palette = palette;
        }

        getId() {
            if (this.isExtruding()) {
                return Choropleth.ExtrusionID
            }
            return Choropleth.ID
        }
        getLayerIDs() {
            return [Choropleth.ID, Choropleth.OutlineID, Choropleth.ExtrusionID];
        }

        addLayer(settings: MapboxSettings, beforeLayerId, roleMap) {
            const map = this.parent.getMap();

            const choroSettings = settings.choropleth;
            const sourceLayer = choroSettings.getCurrentSourceLayer()
            const vectorProperty = choroSettings.getCurrentVectorProperty()
            const zeroFilter = ["==", vectorProperty, ""]

            const choroplethLayer = mapboxUtils.decorateLayer({
                id: Choropleth.ID,
                type: "fill",
                source: 'choropleth-source',
                "source-layer": sourceLayer
            });
            const extrusionLayer = mapboxUtils.decorateLayer({
                id: Choropleth.ExtrusionID,
                type: "fill-extrusion",
                source: 'choropleth-source',
                "source-layer": sourceLayer,
                paint: {

                },
            })
            const outlineLayer = mapboxUtils.decorateLayer({
                id: Choropleth.OutlineID,
                type: 'line',
                layout: {
                    "line-join": "round"
                },
                paint: {
                    "line-width": 0
                },
                source: 'choropleth-source',
                "source-layer": sourceLayer
            });

            const highlightLayer = mapboxUtils.decorateLayer({
                id: Choropleth.HighlightID,
                type: 'fill',
                source: 'choropleth-source',
                paint: {
                    "fill-color": choroSettings.highlightColor,
                    "fill-opacity": 1
                },
                "source-layer": sourceLayer,
                filter: zeroFilter
            });

            const highlightOutlineLayer = mapboxUtils.decorateLayer({
                id: Choropleth.HighlightOutlineID,
                type: 'line',
                layout: {
                    "line-join": "round"
                },
                paint: {
                    "line-width": 1,
                    "line-color": 'black',
                },
                source: 'choropleth-source',
                "source-layer": sourceLayer,
                filter: zeroFilter,
            });

            const extrusionHighlightLayer = mapboxUtils.decorateLayer({
                id: Choropleth.ExtrusionHighlightID,
                type: "fill-extrusion",
                source: 'choropleth-source',
                paint: {
                    "fill-extrusion-color": choroSettings.highlightColor,
                    "fill-extrusion-opacity": 1
                },
                "source-layer": sourceLayer,
                filter: zeroFilter
            });

            map.addLayer(extrusionHighlightLayer, beforeLayerId);
            map.addLayer(extrusionLayer, Choropleth.ExtrusionHighlightID);
            map.addLayer(highlightOutlineLayer, Choropleth.ExtrusionID);
            map.addLayer(highlightLayer, Choropleth.HighlightOutlineID);
            map.addLayer(outlineLayer, Choropleth.HighlightID);
            map.addLayer(choroplethLayer, Choropleth.OutlineID);
        }

        isExtruding() {
            return this.parent.getRoleMap().size && this.settings.height > 0
        }

        hoverHighLight(e) {
            if (!this.layerExists()) {
                return;
            }

            const map = this.parent.getMap();
            const choroSettings = this.settings;
            const vectorProperty = choroSettings.getCurrentVectorProperty()
            const featureVectorProperty = e.features[0].properties[vectorProperty]
            if (this.isExtruding()) {
                map.setFilter(Choropleth.ExtrusionHighlightID, ["==", vectorProperty, featureVectorProperty]);
            }
            else {
                map.setFilter(Choropleth.HighlightID, ["==", vectorProperty, featureVectorProperty]);
                map.setFilter(Choropleth.HighlightOutlineID, ["==", vectorProperty, featureVectorProperty]);
            }
        }

        removeHighlight(roleMap) {
            if (!this.layerExists()) {
                return;
            }

            const choroSettings = this.settings;
            const vectorProperty = choroSettings.getCurrentVectorProperty()
            const zeroFilter = ["==", vectorProperty, ""]
            const map = this.parent.getMap();

            map.setPaintProperty(Choropleth.ID, 'fill-opacity', choroSettings.opacity / 100);
            map.setPaintProperty(Choropleth.ExtrusionID, 'fill-extrusion-opacity', choroSettings.opacity / 100);
            map.setFilter(Choropleth.HighlightID, zeroFilter);
            map.setFilter(Choropleth.HighlightOutlineID, zeroFilter);
            map.setFilter(Choropleth.ExtrusionHighlightID, zeroFilter);
        }

        updateSelection(features, roleMap) {
            const map = this.parent.getMap();
            const choroSettings = this.settings;
            const vectorProperty = choroSettings.getCurrentVectorProperty()

            let locationFilter = [];
            locationFilter.push("any");
            let featureNameMap = {};
            let selectionIds = features
                .filter((feature) => {
                    // Dedupliacate features since features may appear multiple times in query results
                    if (featureNameMap[feature.properties[vectorProperty]]) {
                        return false;
                    }

                    featureNameMap[feature.properties[vectorProperty]] = true;
                    return true;
                })
                .slice(0, constants.MAX_SELECTION_COUNT)
                .map( (feature, i) => {
                    locationFilter.push(["==", vectorProperty, feature.properties[vectorProperty]]);
                    return feature.properties[vectorProperty];
                });

            this.filter.addSelection(selectionIds, roleMap.location)

            const opacity = this.filter.getSelectionOpacity(choroSettings.opacity)
            map.setPaintProperty(Choropleth.ID, 'fill-opacity', opacity);
            map.setPaintProperty(Choropleth.ExtrusionID, 'fill-extrusion-opacity', opacity);
            map.setFilter(Choropleth.HighlightID, locationFilter);
            map.setFilter(Choropleth.HighlightOutlineID, locationFilter);
            if (this.isExtruding()) {
                map.setFilter(Choropleth.ExtrusionHighlightID, locationFilter);
            }
            return selectionIds
        }

        removeLayer() {
            const map = this.parent.getMap();
            map.removeLayer(Choropleth.ID);
            map.removeLayer(Choropleth.OutlineID);
            map.removeLayer(Choropleth.HighlightID);
            map.removeLayer(Choropleth.HighlightOutlineID);
            map.removeLayer(Choropleth.ExtrusionID);
            map.removeLayer(Choropleth.ExtrusionHighlightID);
            this.source.removeFromMap(map, Choropleth.ID);
        }

        getSource(settings) {
            const choroSettings = settings.choropleth;
            if (choroSettings.show) {
                ChoroplethSettings.fillPredefinedProperties(choroSettings);
                if (choroSettings.hasChanged(this.settings)) {
                    if (this.settings &&
                        this.settings.vectorTileUrl1 &&
                        this.settings.sourceLayer1 &&
                        this.settings.vectorProperty1) {
                            this.removeLayer();
                    }
                    this.settings = choroSettings;
                }
            }
            return super.getSource(settings);
        }

        sizeInterpolate(sizeLimits: mapboxUtils.Limits, choroSettings: ChoroplethSettings, size: number): number {
            if (size === null) {
                return 0
            }
            const k = choroSettings.baseHeight + (size - sizeLimits.min) * (choroSettings.height - choroSettings.baseHeight) / (sizeLimits.max - sizeLimits.min)
            return k
        }

        setCalculatedProps(map: any, colors: object, sizes: object | number, roleMap) {
            map.setPaintProperty(Choropleth.ID, 'fill-color', colors);
            map.setPaintProperty(Choropleth.ExtrusionID, 'fill-extrusion-color', colors);
            if (roleMap.size) {
                map.setPaintProperty(Choropleth.ExtrusionID, 'fill-extrusion-height', sizes)
                map.setPaintProperty(Choropleth.ExtrusionHighlightID, 'fill-extrusion-height', sizes)
            }
            else {
                map.setPaintProperty(Choropleth.ExtrusionID, 'fill-extrusion-height', 0)
                map.setPaintProperty(Choropleth.ExtrusionHighlightID, 'fill-extrusion-height', 0)
            }
        }

        setFilters(map: any, filter: any[], settings: ChoroplethSettings) {
            const vectorProperty = settings[`vectorProperty${settings.currentLevel}`];
            const zeroFilter = ["==", vectorProperty, ""]
            map.setFilter(Choropleth.ID, filter);
            map.setFilter(Choropleth.OutlineID, filter);
            if (this.isExtruding()) {
                map.setFilter(Choropleth.ID, zeroFilter)
                map.setFilter(Choropleth.ExtrusionID, filter)
                map.setPitch(settings.extrusionPitch)
            } else {
                map.setFilter(Choropleth.ExtrusionID, zeroFilter)
                // map.setPitch(0)
         }

        }

        setFillProps(map: any, settings: ChoroplethSettings) {
            map.setPaintProperty(Choropleth.ID, 'fill-outline-color', 'rgba(0,0,0,0.05)');
            map.setPaintProperty(Choropleth.HighlightID, "fill-color", settings.highlightColor)
            map.setPaintProperty(Choropleth.ExtrusionHighlightID, "fill-extrusion-color", settings.highlightColor)
            map.setPaintProperty(Choropleth.ExtrusionHighlightID, 'fill-extrusion-base', settings.baseHeight);
            map.setPaintProperty(Choropleth.ExtrusionID, 'fill-extrusion-base', settings.baseHeight);
        }

        setLineProps(map: any, settings: ChoroplethSettings) {
            map.setPaintProperty(Choropleth.OutlineID, 'line-color', settings.outlineColor);
            map.setPaintProperty(Choropleth.OutlineID, 'line-width', settings.outlineWidth);
            map.setPaintProperty(Choropleth.OutlineID, 'line-opacity', settings.outlineOpacity / 100);
        }

        setZoom(map: any, settings: ChoroplethSettings) {
            map.setLayerZoomRange(Choropleth.ID, settings.minZoom, settings.maxZoom);
        }

        getFunctionForColorOfLocation(roleMap: RoleMap, colorSettings: string[], fillColorLimits: mapboxUtils.Limits): any {
            const isGradient = mapboxUtils.shouldUseGradient(roleMap.color);
            if (isGradient) {
                const fillClassCount = mapboxUtils.getClassCount(fillColorLimits);
                const fillDomain = mapboxUtils.getNaturalBreaks(fillColorLimits, fillClassCount);
                const getColorOfLocation = chroma.scale(colorSettings).domain(fillDomain);
                this.colorStops = fillDomain.map((colorStop) => {
                    const color = getColorOfLocation(colorStop).toString();
                    return {colorStop, color};
                });
                return getColorOfLocation
            }

            fillColorLimits.values.forEach((colorStop) => {
                const color = this.palette.getColor(colorStop)
                this.colorStops.push({colorStop, color})
            });
            return (value => this.palette.getColor(value))
        }

        preprocessData(roleMap : RoleMap, choroplethData, getColorOfLocation ): {location: string, color: string, size: number}[] {
            const existingStops = {};
            const result = [];

            for (let row of choroplethData) {

                const location = row[roleMap.location.displayName];
                const color = getColorOfLocation(row[roleMap.color.displayName]);

                if (!location || !color) {
                    // Stop value cannot be undefined or null; don't add this row to the stops
                    continue;
                }

                const locationStr = location.toString()
                if (existingStops[locationStr]) {
                    // Duplicate stop found. In case there are many rows, Mapbox generates so many errors on the
                    // console, that it can make the entire Power BI plugin unresponsive. This is why we validate
                    // the stops here, and won't let invalid stops to be passed to Mapbox.
                    return []
                }
                existingStops[locationStr] = true;

                const size = roleMap.size ? row[roleMap.size.displayName] : null
                result.push({
                    location,
                    color,
                    size,
                })
            }

            return result;
        }

        applySettings(settings:MapboxSettings, roleMap: RoleMap) {
            super.applySettings(settings, roleMap);
            const map = this.parent.getMap();
            this.settings = settings.choropleth
            const choroSettings = settings.choropleth;

            if (map.getLayer(Choropleth.ID)) {
                map.setLayoutProperty(Choropleth.ID, 'visibility', choroSettings.display() ? 'visible' : 'none');
            }

            if (choroSettings.display()) {
                const fillColorLimits = this.source.getLimits().color;
                ChoroplethSettings.fillPredefinedProperties(choroSettings);
                const choroColorSettings = [choroSettings.minColor, choroSettings.medColor, choroSettings.maxColor];

                this.colorStops = []
                const choroplethData = this.source.getData(map, settings);
                const getColorOfLocation = this.getFunctionForColorOfLocation(roleMap, choroColorSettings, fillColorLimits)
                const preprocessedData = this.preprocessData(roleMap, choroplethData, getColorOfLocation)

                if (preprocessedData) {
                    // We use the old property function syntax here because the data-join technique is faster to parse still than expressions with this method
                    const property = choroSettings.getCurrentVectorProperty()

                    const defaultColor = 'rgba(0,0,0,0)';
                    const colors = { type: "categorical", property, default: defaultColor, stops: [] };

                    const sizeLimits = this.source.getLimits().size;
                    const sizes: any = roleMap.size ? { type: "categorical", property, default: 0, stops: [] } : choroSettings.height * Choropleth.HeightMultiplier

                    const filter = ['in', property];

                    preprocessedData.forEach(({location, color, size}) => {
                        filter.push(location);
                        colors.stops.push([location, color.toString()]);
                        if (roleMap.size) {
                            sizes.stops.push([location, this.sizeInterpolate(sizeLimits, choroSettings, size) * Choropleth.HeightMultiplier])
                        }
                    })
                    this.setCalculatedProps(map, colors, sizes, roleMap)
                    this.setFilters(map, filter, choroSettings)
                } else {
                    map.setPaintProperty(Choropleth.ID, 'fill-color', 'rgb(0, 0, 0)');
                    map.setPaintProperty(Choropleth.ExtrusionID, 'fill-extrusion-color', 'rgb(0, 0, 0)');
                }

                this.setLineProps(map, choroSettings)
                this.setFillProps(map, choroSettings)
                this.setZoom(map, choroSettings)
            }
        }

        showLegend(settings: MapboxSettings) {
            return settings.choropleth.legend && super.showLegend(settings)
        }

        handleTooltip(tooltipEvent, roleMap, settings: MapboxSettings) {
            const tooltipData = super.handleTooltip(tooltipEvent, roleMap, settings);
            let choroVectorData = null;
            tooltipData.map(td => {
                if (choroVectorData) {
                    return;
                }

                if (td.displayName === settings.choropleth.getCurrentVectorProperty()) {
                    choroVectorData = td;
                }
            });
            if (!choroVectorData) {
                // Error! Could not found choropleth data joining on selected vector property
                return tooltipData;
            }

            const choroplethSource = this.getSource(settings);
            if (!choroplethSource) {
                // Error! No datasource found for choropleth layer
                return tooltipData;
            }

            const choroplethData = choroplethSource.getData(settings, this.parent.getMap());
            const locationProperty = roleMap.location.displayName;
            let dataUnderLocation = null;
            choroplethData.map(cd => {
                if (dataUnderLocation) {
                    return;
                }

                if (cd[locationProperty] == choroVectorData.value) {
                    dataUnderLocation = cd;
                }
            });

            if (!dataUnderLocation) {
                return tooltipData;
            }

            return Object.keys(dataUnderLocation).reduce((result, key) => {
                let value = 'null';
                if (dataUnderLocation[key] !== null && dataUnderLocation[key] !== undefined) {
                    value = dataUnderLocation[key].toString();
                }

                let format = this.getToolTipFormat(roleMap, key)
                if (format != undefined) {
                    value = numeral(value).format(format);
                }

                const tooltipValue = {
                    displayName: key,
                    value
                }
                if (key == locationProperty) {
                    // The location property should always be the first tooltip item...
                    result.unshift(tooltipValue)
                } else {
                    // ... and then we can have the rest of the tooltip role items
                    result.push(tooltipValue)
                }
                return result
            }, [])
        }
    }
}
