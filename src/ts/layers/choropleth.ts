module powerbi.extensibility.visual {

    export class Choropleth extends Layer {
        private static ID = 'choropleth'
        private static OutlineID = 'choropleth-outline'
        private settings: ChoroplethSettings;
        private static HighlightID = 'choropleth-highlight'

        private palette: IColorPalette;

        constructor(map: MapboxMap, palette: IColorPalette) {
            super(map);
            this.id = Choropleth.ID;
            this.source = data.Sources.Choropleth;
            this.palette = palette;
        }

        getLayerIDs() {
            return [Choropleth.ID, Choropleth.OutlineID];
        }

        addLayer(settings, beforeLayerId, roleMap) {
            const map = this.parent.getMap();

            const choroSettings = settings.choropleth;
            const sourceLayer = choroSettings[`sourceLayer${choroSettings.currentLevel}`];
            const vectorProperty = choroSettings[`vectorProperty${choroSettings.currentLevel}`];

            const choroplethLayer = mapboxUtils.decorateLayer({
                id: Choropleth.ID,
                type: "fill",
                source: 'choropleth-source',
                "source-layer": sourceLayer
            });

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

            const zeroFilter = ["==", vectorProperty, ""]
            const highlightLayer = mapboxUtils.decorateLayer({
                id: Choropleth.HighlightID,
                type: 'fill',
                source: 'choropleth-source',
                paint: {
                    "fill-color": constants.HIGHLIGHT_COLOR,
                    "fill-opacity": 1
                },
                "source-layer": sourceLayer,
                filter: zeroFilter
            });

            map.addLayer(highlightLayer, beforeLayerId);
            map.addLayer(outlineLayer, Choropleth.HighlightID);
            map.addLayer(choroplethLayer, Choropleth.OutlineID);

            map.on("mousemove", Choropleth.ID, mapboxUtils.debounce( (e) => {
                if (!this.parent.hasSelection()) {
                    map.setFilter(Choropleth.HighlightID, ["==", vectorProperty, e.features[0].properties.name]);
                }
            }, 12, true));
            map.on("mouseleave", Choropleth.ID, () => {
                if (!this.parent.hasSelection()) {
                    this.removeHighlight(roleMap, settings)
                }
            });
        }

        removeHighlight(roleMap, settings) {
            const choroSettings = settings.choropleth;
            const vectorProperty = choroSettings[`vectorProperty${choroSettings.currentLevel}`];
            const zeroFilter = ["==", vectorProperty, ""]
            const map = this.parent.getMap();
            map.setFilter(Choropleth.HighlightID, zeroFilter);
        }

        updateSelection(features, roleMap, settings) {
            const map = this.parent.getMap();
            const choroSettings = settings.choropleth;
            const vectorProperty = choroSettings[`vectorProperty${choroSettings.currentLevel}`];

            let locationFilter = [];
            locationFilter.push("any");
            this.parent.clearSelection();
            features.map( (feature, i) => {
                locationFilter.push(["==", vectorProperty, feature.properties.name]);
                this.parent.addSelection(feature.properties.name, true);
            });
            map.setFilter(Choropleth.HighlightID, locationFilter);
        }

        removeLayer() {
            const map = this.parent.getMap();
            map.removeLayer(Choropleth.ID);
            map.removeLayer(Choropleth.OutlineID);
            this.source.removeFromMap(map, Choropleth.ID);
        }

        getBounds(settings): any[] {
            const map = this.parent.getMap();
            let source: any;
            let bounds: any[];

            if (map.getSource('choropleth-source') && map.isSourceLoaded('choropleth-source')) {
                source = map.getSource('choropleth-source');
                bounds = source.bounds;
                return bounds
            }
            else {
                // If the source isn't loaded, fit bounds after source loads
                let sourceLoaded = function (e) {
                    if (e.sourceId === 'choropleth-source') {
                        source = map.getSource('choropleth-source');
                        map.off('sourcedata', sourceLoaded);
                        bounds = source.bounds;
                        if (settings.api.autozoom) {
                            map.fitBounds(bounds, {
                                padding: 20,
                                maxZoom: 15,
                            });
                        }
                    }
                }
                map.on('sourcedata', sourceLoaded);
            }
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

        applySettings(settings, roleMap, colorMap) {
            super.applySettings(settings, roleMap, colorMap);
            const map = this.parent.getMap();
            const choroSettings = settings.choropleth;

            if (map.getLayer(Choropleth.ID)) {
                map.setLayoutProperty(Choropleth.ID, 'visibility', choroSettings.display() ? 'visible' : 'none');
            }

            if (choroSettings.display()) {
                const fillColorLimits = this.source.getLimits();

                ChoroplethSettings.fillPredefinedProperties(choroSettings);
                let fillClassCount = mapboxUtils.getClassCount(fillColorLimits);
                const choroColorSettings = [choroSettings.minColor, choroSettings.medColor, choroSettings.maxColor];
                let isGradient = mapboxUtils.shouldUseGradient(roleMap.color, fillColorLimits);

                let getColorStop = null;
                if (isGradient) {
                    let fillDomain: any[] = mapboxUtils.getNaturalBreaks(fillColorLimits, fillClassCount);
                    getColorStop = chroma.scale(choroColorSettings).domain(fillDomain);
                }
                else {
                    let colorStops = {};
                    fillColorLimits.values.map((value, idx) => {
                        const color = chroma(this.palette.getColor(idx.toString()).value);
                        colorStops[value] = color;
                    });
                    getColorStop = (value) => {
                        return colorStops[value]
                    }
                }

                // We use the old property function syntax here because the data-join technique is faster to parse still than expressions with this method
                const defaultColor = 'rgba(0,0,0,0)';
                const property = choroSettings[`vectorProperty${choroSettings.currentLevel}`];
                let colors = { type: "categorical", property, default: defaultColor, stops: [] };
                let outlineColors = { type: "categorical", property, default: defaultColor, stops: [] };
                let filter = ['in', property];
                const choroplethData = this.source.getData(map, settings);

                let existingStops = {};
                let validStops = true;

                for (let row of choroplethData) {
                    const location = row[roleMap.location.displayName];

                    let color: any = getColorStop(row[roleMap.color.displayName]);
                    let outlineColor: any = getColorStop(row[roleMap.color.displayName]);

                    if (!location || !color || !outlineColor) {
                        // Stop value cannot be undefined or null; don't add this row to the stops
                        continue;
                    }


                    if (existingStops[location]) {
                        // Duplicate stop found. In case there are many rows, Mapbox generates so many errors on the
                        // console, that it can make the entire Power BI plugin unresponsive. This is why we validate
                        // the stops here, and won't let invalid stops to be passed to Mapbox.
                        validStops = false;
                        break;
                    }


                    existingStops[location] = true;
                    colors.stops.push([location, color.toString()]);
                    filter.push(location);
                    outlineColors.stops.push([location, outlineColor.toString()]);
                }

                if (validStops) {
                    map.setPaintProperty(Choropleth.ID, 'fill-color', colors);
                } else {
                    map.setPaintProperty(Choropleth.ID, 'fill-color', 'rgb(0, 0, 0)');
                }
                map.setFilter(Choropleth.ID, filter);
                map.setFilter(Choropleth.OutlineID, filter);

                map.setPaintProperty(Choropleth.ID, 'fill-outline-color', 'rgba(0,0,0,0.05)');
                map.setPaintProperty(Choropleth.ID, 'fill-opacity', settings.choropleth.opacity / 100);

                map.setPaintProperty(Choropleth.OutlineID, 'line-color', settings.choropleth.outlineColor);
                map.setPaintProperty(Choropleth.OutlineID, 'line-width', settings.choropleth.outlineWidth);
                map.setPaintProperty(Choropleth.OutlineID, 'line-opacity', settings.choropleth.outlineOpacity / 100);
                map.setLayerZoomRange(Choropleth.ID, choroSettings.minZoom, choroSettings.maxZoom);
            }
        }

        hasTooltip() {
            return true;
        }

        handleTooltip(tooltipEvent, roleMap, settings) {
            const tooltipData = super.handleTooltip(tooltipEvent, roleMap, settings);
            const choroVectorData = tooltipData.find(td => {
                return td.displayName === settings.choropleth.vectorProperty;
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
            const dataUnderLocation = choroplethData.find(cd => {
                return cd[locationProperty] == choroVectorData.value;
            });

            if (!dataUnderLocation) {
                return tooltipData;
            }

            return Object.keys(dataUnderLocation).map(key => {
                let value = 'null';
                if (dataUnderLocation[key] !== null && dataUnderLocation[key] !== undefined) {
                    value = dataUnderLocation[key].toString();
                }
                return {
                    displayName: key,
                    value
                };
            });
        }
    }
}
