module powerbi.extensibility.visual {

    export class Choropleth extends Layer {
        private static ID = 'choropleth'
        private static OutlineID = 'choropleth-outline'
        private vectorTileUrl: string = "";

        constructor(map: MapboxMap) {
            super(map);
            this.id = Choropleth.ID;
            this.source = data.Sources.Choropleth;
        }

        getLayerIDs() {
            return [ Choropleth.ID, Choropleth.OutlineID ];
        }

        addLayer(settings, beforeLayerId) {
            const map = this.parent.getMap();
            const choroplethLayer = mapboxUtils.decorateLayer({
                id: Choropleth.ID,
                type: "fill",
                source: 'choropleth-source',
                "source-layer": settings.choropleth.sourceLayer
            });
            const outlineLayer = mapboxUtils.decorateLayer({
                id: Choropleth.OutlineID,
                type: 'line',
                source: 'choropleth-source',
                "source-layer": settings.choropleth.sourceLayer
            });
            map.addLayer(outlineLayer, beforeLayerId);
            map.addLayer(choroplethLayer, Choropleth.OutlineID);
        }

        removeLayer() {
            const map = this.parent.getMap();
            map.removeLayer(Choropleth.ID);
            map.removeLayer(Choropleth.OutlineID);
            this.source.removeFromMap(map, Choropleth.ID);
        }


        getBounds() : any[] {
            const map = this.parent.getMap();
            const source: any = map.getSource('choropleth-source');
            if (source && source.bounds) {
                return source.bounds
            }
            return null
        }

        getSource(settings) {
            const choroSettings = settings.choropleth;
            if (choroSettings.show) {
                ChoroplethSettings.fillPredefinedProperties(choroSettings);

                // The choropleth layer is different since it is a vector tile source, not geojson.  We can't modify it in-place.
                // If it is, we'll create the vector tile source from the URL.  If not, we'll make sure the source doesn't exist.
                if (this.vectorTileUrl != choroSettings.vectorTileUrl) {
                    if (this.vectorTileUrl) {
                        this.removeLayer();
                    }
                    this.vectorTileUrl = choroSettings.vectorTileUrl;
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

                let isGradient = mapboxUtils.shouldUseGradient(roleMap.color, fillColorLimits);
                let fillClassCount = mapboxUtils.getClassCount(fillColorLimits);
                let fillDomain: any[] = mapboxUtils.getNaturalBreaks(fillColorLimits, fillClassCount);
                const choroColorSettings = [choroSettings.minColor, choroSettings.medColor, choroSettings.maxColor];
                let colorStops = chroma.scale(choroColorSettings).domain(fillDomain);

                // We use the old property function syntax here because the data-join technique is faster to parse still than expressions with this method
                const defaultColor = 'rgba(0,0,0,0)';
                let colors = {type: "categorical", property: choroSettings.vectorProperty, default: defaultColor, stops: []};
                let outlineColors = {type: "categorical", property: choroSettings.vectorProperty, default: defaultColor, stops: []};
                let filter = ['in', choroSettings.vectorProperty];
                const choroplethData = this.source.getData(map, settings);

                let existingStops = {};
                let validStops = true;

                for (let row of choroplethData) {
                    const location = row[roleMap.location.displayName];
                    let color: any = colorStops(row[roleMap.color.displayName]);
                    let outlineColor: any = colorStops(row[roleMap.color.displayName]);
                    outlineColor = outlineColor.darken(2);

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
                    map.setFilter(Choropleth.ID, filter);
                    map.setFilter(Choropleth.OutlineID, filter);
                } else {
                    // Default color should represent error to the user, that's all we have for now
                    map.setPaintProperty(Choropleth.ID, 'fill-color', defaultColor);
                }

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
                return cd[locationProperty] === choroVectorData.value;
            });

            if (!dataUnderLocation) {
                return tooltipData;
            }

            return Object.keys(dataUnderLocation).map(key => {
                const value = dataUnderLocation[key] ? dataUnderLocation[key].toString() : 'null';
                return {
                    displayName: key,
                    value
                };
            });
        }
    }
}
