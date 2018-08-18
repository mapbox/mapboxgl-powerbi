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
            this.source = data.Sources.Choropleth;
            this.palette = palette;
        }

        getLayerIDs() {
            return [Choropleth.ID, Choropleth.OutlineID];
        }

        addLayer(settings, beforeLayerId, roleMap) {


            console.log('++Choropleth - AddLayer');
          

            let layerType: string = 'fill'
            let fillOpacityType: string = 'fill-opacity'
            let fillColorType: string = 'fill-color'

            const map = this.parent.getMap();

            const choroSettings = settings.choropleth;
            const sourceLayer = choroSettings[`sourceLayer${choroSettings.currentLevel}`];
            const vectorProperty = choroSettings[`vectorProperty${choroSettings.currentLevel}`];

            //Add base dot layer
            this.pointLayerBase(choroSettings);

            //if Extrusion change fillTypes    
            if (choroSettings.extrusion == true) {
                layerType = 'fill-extrusion'
                fillOpacityType = 'fill-extrusion-opacity'
                fillColorType = 'fill-extrusion-color'
            }

            const choroplethLayer = mapboxUtils.decorateLayer({
                id: Choropleth.ID,
                type: layerType,
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
                type: 'fill-extrusion',
                source: 'choropleth-source',
                paint: {
                    "fill-extrusion-color": choroSettings.highlightColor,
                    'fill-extrusion-opacity': 0.9
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

            // map.addLayer(highlightOutlineLayer, beforeLayerId);
            map.addLayer(highlightLayer, beforeLayerId);
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
            // map.setFilter(Choropleth.HighlightOutlineID, ["==", vectorProperty, e.features[0].properties[vectorProperty]]);
        }


        removeHighlight(roleMap) {
            if (!this.layerExists()) {
                return;
            }

            const choroSettings = this.settings;
            const vectorProperty = choroSettings[`vectorProperty${choroSettings.currentLevel}`];
            const zeroFilter = ["==", vectorProperty, ""]
            const map = this.parent.getMap();

            // map.setPaintProperty(Choropleth.ID, 'fill-extrusion-opacity', 1);
            map.setFilter(Choropleth.HighlightID, zeroFilter);
            // map.setFilter(Choropleth.HighlightOutlineID, zeroFilter);
        }

        updateSelection(features, roleMap) {
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
                .map((feature, i) => {
                    locationFilter.push(["==", vectorProperty, feature.properties[vectorProperty]]);
                    return feature.properties[vectorProperty];
                });

            this.parent.addSelection(selectionIds, roleMap.location)

            let opacity = choroSettings.opacity / 100;
            if (this.parent.hasSelection()) {
                opacity = 0.5 * opacity;
            }
            //map.setPaintProperty(Choropleth.ID, 'fill-extrusion-opacity', 1);
            map.setFilter(Choropleth.HighlightID, locationFilter);
            // map.setFilter(Choropleth.HighlightOutlineID, locationFilter);
        }

        removeLayer() {
            const map = this.parent.getMap();
            map.removeLayer(Choropleth.ID);
            map.removeLayer(Choropleth.OutlineID);
            map.removeLayer(Choropleth.HighlightID);
            // map.removeLayer(Choropleth.HighlightOutlineID);
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
            console.log('++Choropleth - Apply Settings');
            super.applySettings(settings, roleMap);
            const map = this.parent.getMap();
            const choroSettings = settings.choropleth;
            let layerType: string = 'fill'
            let fillOpacityType: string = 'fill-opacity'
            let fillColorType: string = 'fill-color'
            let heightDomain: any[]
            let heightClsSize: number

            //if Extrusion change fillTypes    
            if (choroSettings.extrusion == true) {
                layerType = 'fill-extrusion'
                fillOpacityType = 'fill-extrusion-opacity'
                fillColorType = 'fill-extrusion-color'
            }

            if (map.getLayer(Choropleth.ID)) {
                map.setLayoutProperty(Choropleth.ID, 'visibility', choroSettings.display() ? 'visible' : 'none');
            }

            if (choroSettings.display()) {
                const fillColorLimits = this.source.getLimits();
                ChoroplethSettings.fillPredefinedProperties(choroSettings);
                let fillClassCount = mapboxUtils.getClassCount(fillColorLimits);
                const choroColorSettings = [choroSettings.minColor, choroSettings.medColor, choroSettings.maxColor];
                let isGradient = mapboxUtils.shouldUseGradient(roleMap.color);


                //for 3D Extrusion 
                if (choroSettings.extrusion == true) {
                    const heightLimits = data.Sources.Choropleth.getHeightLimits();

                    let heightClassCount = mapboxUtils.getClassCount(heightLimits);

                    heightDomain = mapboxUtils.getNaturalBreaks(heightLimits, choroSettings.extrusionSteps);

                    let maxHeight: number = choroSettings.extrusionMaxHeight;
                    heightClsSize = maxHeight / heightClassCount;

                }

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
                let heights = { type: "categorical", property, default: 10000, stops: [] };
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

                    //for 3D Extrusion 
                    if (choroSettings.extrusion == true) {
                     
                        let height: any = 0;
                        let heightVal: any = row[roleMap.ExtrusionHeight.displayName];

                        for (let i: number = 1; i < heightDomain.length; i++) {

                            if (heightVal > heightDomain[i - 1] && heightVal <= heightDomain[i]) {
                                height = heightClsSize * i;
                            }
                        }
                        heights.stops.push([locationStr, height]);
                    }
                }





                if (validStops) {
                    map.setPaintProperty(Choropleth.ID, fillColorType, colors);

                    if (layerType == 'fill-extrusion') {
                        map.setPaintProperty(Choropleth.ID, 'fill-extrusion-height', heights);
                        map.setPaintProperty(Choropleth.HighlightID, 'fill-extrusion-height', heights);
                        //map.setPaintProperty(Choropleth.HighlightID, 'fill-extrusion-height', heights);
                    }

                    map.setFilter(Choropleth.ID, filter);
                    map.setFilter(Choropleth.OutlineID, filter);
                } else {
                    map.setPaintProperty(Choropleth.ID, 'fill-extrusion-color', 'rgb(0, 0, 0)');
                }



                let opacity = choroSettings.opacity / 100;
                if (this.parent.hasSelection()) {
                    opacity = 0.5 * opacity;
                }

                let lineOpacity = settings.choropleth.outlineOpacity / 100;
                if (layerType == 'fill-extrusion') {
                    lineOpacity == 0;
                }

                // map.setPaintProperty(Choropleth.ID, 'fill-outline-color', 'rgba(0,0,0,0.05)');

                map.setPaintProperty(Choropleth.ID, fillOpacityType, opacity);

                //map.setPaintProperty(Choropleth.ID, 'fill-extrusion-base', 0);

                map.setPaintProperty(Choropleth.HighlightID, "fill-extrusion-color", choroSettings.highlightColor)

                map.setPaintProperty(Choropleth.OutlineID, 'line-color', settings.choropleth.outlineColor);

                map.setPaintProperty(Choropleth.OutlineID, 'line-width', settings.choropleth.outlineWidth);

                map.setPaintProperty(Choropleth.OutlineID, 'line-opacity', 0);

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

        pointLayerBase(settings) {
            const base_map = this.parent.getMap();
            var souceExist = false;
            var minZoom = settings.geojsonMinZoom;
            var geojsonURL = settings.geojsonURL;
            var tileLayer = settings.pointsourceLayer;
            var n = geojsonURL.includes("mapbox");

            // Create a simple popup.
            var popup = new mapboxgl.Popup({
                closeButton: false,
                offset: 25
            });


            if (base_map.getSource("new_points")) {
                souceExist = true;
            }

            if (n == true && souceExist == false) {

                base_map.addSource("new_points", {
                    "type": "vector",
                    "url": geojsonURL
                });


                base_map.addLayer({
                    "id": "basePoints",
                    "type": "circle",
                    "source": "new_points",
                    "source-layer": tileLayer,
                    "minzoom": minZoom,
                    "paint": {
                        'circle-radius': {
                            'base': .25,
                            'stops': [
                                [5, .5],
                                [6, 1],
                                [9, 3],
                                [12, 6]
                            ]

                        },
                        "circle-color": ["get", "color"],
                    },
                    "filter": ["==", "$type", "Point"],

                });
            }

            //DIRECT GEOJSON TEST end --

            
            base_map.on("mousemove", "basePoints", function(e) {
                base_map.getCanvas().style.cursor = 'pointer';
    
                popup.setLngLat(e.lngLat)
                    .setText(e.features[0].properties.tip)
                    .addTo(base_map);
    
            });
    
            base_map.on("mouseleave", "basePoints", function() {
    
                base_map.getCanvas().style.cursor = '';
                popup.remove();
               
            });

        }

    }
}
