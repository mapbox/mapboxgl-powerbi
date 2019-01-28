module powerbi.extensibility.visual {

    export class Choropleth extends Layer {
        public static readonly ID = 'choropleth'
        public static readonly OutlineID = 'choropleth-outline'
        public static readonly HighlightID = 'choropleth-highlight'
        public static readonly HighlightOutlineID = 'choropleth-highlight-outline'
        public static readonly ExtrusionID = 'choropleth-extrusion'
        public static readonly ExtrusionHighlightID = 'choropleth-extrusion-highlight'
        private static readonly LayerOrder = [
            Choropleth.ID,
            Choropleth.OutlineID,
            Choropleth.HighlightID,
            Choropleth.HighlightOutlineID,
            Choropleth.ExtrusionID,
            Choropleth.ExtrusionHighlightID,
        ]

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

            const layers = {};
            layers[Choropleth.ID] = mapboxUtils.decorateLayer({
                id: Choropleth.ID,
                type: "fill",
                source: 'choropleth-source',
                "source-layer": sourceLayer
            });
            layers[Choropleth.ExtrusionID] = mapboxUtils.decorateLayer({
                id: Choropleth.ExtrusionID,
                type: "fill-extrusion",
                source: 'choropleth-source',
                "source-layer": sourceLayer,
                paint: {

                },
            });
            layers[Choropleth.OutlineID] = mapboxUtils.decorateLayer({
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
            layers[Choropleth.HighlightID] = mapboxUtils.decorateLayer({
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
            layers[Choropleth.HighlightOutlineID] = mapboxUtils.decorateLayer({
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
            layers[Choropleth.ExtrusionHighlightID] = mapboxUtils.decorateLayer({
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

            Choropleth.LayerOrder.forEach((layerId) => map.addLayer(layers[layerId], beforeLayerId));
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
            Choropleth.LayerOrder.forEach((layerId) => map.removeLayer(layerId));
            this.source.removeFromMap(map, Choropleth.ID);
        }

        moveLayer(beforeLayerId: string) {
            const map = this.parent.getMap();
            Choropleth.LayerOrder.forEach((layerId) => map.moveLayer(layerId, beforeLayerId));
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

        getColorStopPicker(isGradient: boolean, colorSettings: any, fillColorLimits: mapboxUtils.Limits, fillClassCount: number) {

            let getColorStop = null;
            if (isGradient) {
                let fillDomain: any[] = mapboxUtils.getNaturalBreaks(fillColorLimits, fillClassCount);
                getColorStop = chroma.scale(colorSettings).domain(fillDomain);
            }
            else {
                let colorStops = {};
                fillColorLimits.values.forEach(value => {
                    colorStops[value] = chroma(this.palette.getColor(value))
                });
                getColorStop = (value) => {
                    return colorStops[value]
                }
            }
            return getColorStop
        }

        applySettings(settings, roleMap) {
            super.applySettings(settings, roleMap);
            const map = this.parent.getMap();
            this.settings = settings.choropleth
            const choroSettings = settings.choropleth;

            if (map.getLayer(Choropleth.ID)) {
                map.setLayoutProperty(Choropleth.ID, 'visibility', choroSettings.display() ? 'visible' : 'none');
            }

            if (choroSettings.display()) {
                const fillColorLimits = this.source.getLimits().color;
                const sizeLimits = this.source.getLimits().size;
                ChoroplethSettings.fillPredefinedProperties(choroSettings);
                let fillClassCount = mapboxUtils.getClassCount(fillColorLimits);
                const choroColorSettings = [choroSettings.minColor, choroSettings.medColor, choroSettings.maxColor];
                let isGradient = mapboxUtils.shouldUseGradient(roleMap.color);
                let getColorStop = this.getColorStopPicker(isGradient, choroColorSettings, fillColorLimits, fillClassCount)

                // We use the old property function syntax here because the data-join technique is faster to parse still than expressions with this method
                const defaultColor = 'rgba(0,0,0,0)';
                const property = choroSettings.getCurrentVectorProperty()
                let colors = { type: "categorical", property, default: defaultColor, stops: [] };
                let sizes: any = roleMap.size ? { type: "categorical", property, default: 0, stops: [] } : choroSettings.height * Choropleth.HeightMultiplier
                let outlineColors = { type: "categorical", property, default: defaultColor, stops: [] };
                let filter = ['in', property];
                const choroplethData = this.source.getData(map, settings);

                let existingStops = {};
                let validStops = true;

                for (let row of choroplethData) {

                    const location = row[roleMap.location.displayName];
                    let outlineColor: any = getColorStop(row[roleMap.color.displayName]);
                    let color: any = getColorStop(row[roleMap.color.displayName]);

                    if (!location || !color || !outlineColor) {
                        // Stop value cannot be undefined or null; don't add this row to the stops
                        continue;
                    }

                    const locationStr = location.toString()


                    if (existingStops[locationStr]) {
                        // Duplicate stop found. In case there are many rows, Mapbox generates so many errors on the
                        // console, that it can make the entire Power BI plugin unresponsive. This is why we validate
                        // the stops here, and won't let invalid stops to be passed to Mapbox.
                        validStops = false;
                        break;
                    }


                    existingStops[locationStr] = true;

                    colors.stops.push([location, color.toString()]);
                    if (roleMap.size) {
                        const size = row[roleMap.size.displayName]
                        sizes.stops.push([location, this.sizeInterpolate(sizeLimits, choroSettings, size) * Choropleth.HeightMultiplier])
                    }
                    filter.push(location);
                    outlineColors.stops.push([location, outlineColor.toString()]);
                }

                if (validStops) {
                    this.setCalculatedProps(map, colors, sizes, roleMap)
                } else {
                    map.setPaintProperty(Choropleth.ID, 'fill-color', 'rgb(0, 0, 0)');
                    map.setPaintProperty(Choropleth.ExtrusionID, 'fill-extrusion-color', 'rgb(0, 0, 0)');
                }

                this.setFilters(map, filter, choroSettings)
                this.setLineProps(map, choroSettings)
                this.setFillProps(map, choroSettings)
                this.setZoom(map, choroSettings)
            }
        }

        handleTooltip(tooltipEvent, roleMap, settings: MapboxSettings) {
            const tooltipData = Layer.getTooltipData(tooltipEvent.data);
            let choroVectorData = tooltipData.filter(td => (td.displayName === settings.choropleth.getCurrentVectorProperty()))[0];
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
            const dataUnderLocation = choroplethData.filter((cd) => (cd[locationProperty] == choroVectorData.value))[0];

            if (!dataUnderLocation) {
                return tooltipData;
            }
            const topTooltip = {
                displayName: locationProperty,
                value: dataUnderLocation[locationProperty].toString()
            }
            let result = Object.keys(roleMap.tooltips).map((key) => {
                const data = {
                    displayName: key,
                    value: "null",
                }
                if (dataUnderLocation[key]) {
                    data.value = dataUnderLocation[key];
                    data.value = this.getFormattedTooltipValue(roleMap, data).toString()
                }
                return data
            })
            result.unshift(topTooltip)
            return result
        }
    }
}
