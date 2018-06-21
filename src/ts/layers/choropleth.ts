module powerbi.extensibility.visual {

    export class Choropleth extends Layer {
        public static readonly ID = 'choropleth'
        private static OutlineID = 'choropleth-outline'
        private settings: ChoroplethSettings;
        private static HighlightID = 'choropleth-highlight'
        private static HighlightOutlineID = 'choropleth-highlight-outline'

        private palette: Palette;

        constructor(map: MapboxMap, palette: Palette) {
            super(map);
            this.id = Choropleth.ID;
            console.log('ChoroPleth ID:' + Choropleth.ID)
            this.source = data.Sources.Choropleth;
            this.palette = palette;
        }

        getLayerIDs() {
            return [Choropleth.ID, Choropleth.OutlineID];
        }

        addLayer(settings, beforeLayerId, roleMap) {
            const map = this.parent.getMap();

            console.log('addLayer: ' +  Choropleth.ID)
            console.log(settings.choropleth)

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

            map.addLayer(highlightOutlineLayer, beforeLayerId);
            map.addLayer(highlightLayer, Choropleth.HighlightOutlineID);
            map.addLayer(outlineLayer, Choropleth.HighlightID);
            map.addLayer(choroplethLayer, Choropleth.OutlineID);
        }

        hoverHighLight(e) {
            if (!this.layerExists()) {
                return;
            }

            const map = this.parent.getMap();
            const choroSettings = this.settings;
            const vectorProperty = choroSettings[`vectorProperty${choroSettings.currentLevel}`];
            map.setFilter(Choropleth.HighlightID, ["==", vectorProperty, e.features[0].properties[vectorProperty]]);
            map.setFilter(Choropleth.HighlightOutlineID, ["==", vectorProperty, e.features[0].properties[vectorProperty]]);
        }

        removeHighlight(roleMap) {
            if (!this.layerExists()) {
                return;
            }

            const choroSettings = this.settings;
            const vectorProperty = choroSettings[`vectorProperty${choroSettings.currentLevel}`];
            const zeroFilter = ["==", vectorProperty, ""]
            const map = this.parent.getMap();

            map.setPaintProperty(Choropleth.ID, 'fill-opacity', choroSettings.opacity / 100);
            map.setFilter(Choropleth.HighlightID, zeroFilter);
            map.setFilter(Choropleth.HighlightOutlineID, zeroFilter);
        }

        updateSelection(features, roleMap) {
            console.log('++choropleth: UpdateSelection')
            const map = this.parent.getMap();
            const choroSettings = this.settings;
            const vectorProperty = choroSettings[`vectorProperty${choroSettings.currentLevel}`];

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

            this.parent.addSelection(selectionIds, roleMap.location)

            let opacity = choroSettings.opacity / 100;
            if (this.parent.hasSelection()) {
                opacity = 0.5 * opacity;
            }
            map.setPaintProperty(Choropleth.ID, 'fill-opacity', opacity);
            map.setFilter(Choropleth.HighlightID, locationFilter);
            map.setFilter(Choropleth.HighlightOutlineID, locationFilter);
        }

        removeLayer() {
            const map = this.parent.getMap();
            console.log('Remove ChoroLayer: ' + Choropleth.ID )
            map.removeLayer(Choropleth.ID);
            map.removeLayer(Choropleth.OutlineID);
            map.removeLayer(Choropleth.HighlightID);
            map.removeLayer(Choropleth.HighlightOutlineID);
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

        applySettings(settings, roleMap) {
            super.applySettings(settings, roleMap);
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
                let isGradient = mapboxUtils.shouldUseGradient(roleMap.color);

                let getColorStop = null;
                if (isGradient) {
                    let fillDomain: any[] = mapboxUtils.getNaturalBreaks(fillColorLimits, fillClassCount);
                    getColorStop = chroma.scale(choroColorSettings).domain(fillDomain);
                }
                else {
                    let colorStops = {};
                    fillColorLimits.values.map((value, idx) => {
                        colorStops[value] = chroma(this.palette.getColor(value, idx))
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

                    //console.log('Choropleth location: ' + location)

                    let color: any = getColorStop(row[roleMap.color.displayName]);
                    let outlineColor: any = getColorStop(row[roleMap.color.displayName]);

                    if (!location || !color || !outlineColor) {
                        // Stop value cannot be undefined or null; don't add this row to the stops
                        continue;
                    }

                    const locationStr = location.toString();


                    if (existingStops[locationStr]) {
                        // Duplicate stop found. In case there are many rows, Mapbox generates so many errors on the
                        // console, that it can make the entire Power BI plugin unresponsive. This is why we validate
                        // the stops here, and won't let invalid stops to be passed to Mapbox.
                        validStops = false;
                        break;
                    }


                    existingStops[locationStr] = true;
                    colors.stops.push([locationStr, color.toString()]);
                    filter.push(locationStr);
                    outlineColors.stops.push([locationStr, outlineColor.toString()]);
                }

                if (validStops) {
                    map.setPaintProperty(Choropleth.ID, 'fill-color', colors);
                    map.setFilter(Choropleth.ID, filter);
                    map.setFilter(Choropleth.OutlineID, filter);
                } else {
                    map.setPaintProperty(Choropleth.ID, 'fill-color', 'rgb(0, 0, 0)');
                }

                map.setPaintProperty(Choropleth.ID, 'fill-outline-color', 'rgba(0,0,0,0.05)');
                let opacity = choroSettings.opacity / 100;
                if (this.parent.hasSelection()) {
                    opacity = 0.5 * opacity;
                }
                map.setPaintProperty(Choropleth.ID, 'fill-opacity', opacity);
                map.setPaintProperty(Choropleth.HighlightID, "fill-color", choroSettings.highlightColor)
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
            let choroVectorData = null;
            tooltipData.map(td => {
                if (choroVectorData) {
                    return;
                }

                if (td.displayName === settings.choropleth[`vectorProperty${settings.choropleth.currentLevel}`]) {
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
