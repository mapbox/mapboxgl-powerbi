module powerbi.extensibility.visual {

    export class Choropleth {
        private parent: MapboxMap;
        private static ID = 'choropleth'
        private vectorTileUrl: string = "";
        private colorColumn: any;

        constructor(map: MapboxMap) {
            this.parent = map
        }

        updateColorColumn(columns) {
            this.colorColumn = columns.find( column => {
                return column.roles.color;
            });
        }

        addLayer(beforeLayerId) {
        }

        applySettings(features, settings, roleMap) {
            const map = this.parent.getMap();
            const choroSettings = settings.choropleth;

            if (map.getLayer('choropleth-layer')) {
                map.setLayoutProperty('choropleth-layer', 'visibility', choroSettings.display() ? 'visible' : 'none');
            }
            if (choroSettings.display()) {
                // The choropleth layer is different since it is a vector tile source, not geojson.  We can't modify it in-place.
                // If it is, we'll create the vector tile source from the URL.  If not, we'll make sure the source doesn't exist.
                const newVectorTileUrl = choroSettings.getVectorTileUrl();

                if (this.vectorTileUrl != newVectorTileUrl) {
                    // Update the vector tile source if it exists and has changed.
                    if (map.getSource('choropleth-source')) {
                        if (map.getLayer('choropleth-layer')) {
                            map.removeLayer('choropleth-layer');
                        }
                        map.removeSource('choropleth-source');
                    }
                    this.vectorTileUrl = newVectorTileUrl;
                }

                if (!map.getSource('choropleth-source')) {
                    // Create the vector tile source if it doesn't yet exist
                    map.addSource('choropleth-source', {
                        type: 'vector',
                        url: newVectorTileUrl,
                    });
                }

                const choroplethLayer = mapboxUtils.decorateLayer({
                    id: 'choropleth-layer',
                    type: "fill",
                    source: 'choropleth-source',
                    "source-layer": choroSettings.getSourceLayer()
                });

                if (!map.getLayer('choropleth-layer')) {
                    // add the choropleth layer if it doesn't exist
                    map.addLayer(choroplethLayer, 'cluster');
                }

                let fillColorLimits = mapboxUtils.getLimits(features.choroplethData,roleMap.color);
                let isGradient = mapboxUtils.shouldUseGradient(this.colorColumn, fillColorLimits);
                let fillClassCount = mapboxUtils.getClassCount(fillColorLimits);
                let fillDomain: any[] = mapboxUtils.getNaturalBreaks(fillColorLimits, fillClassCount);
                let colorStops = chroma.scale([choroSettings.minColor, choroSettings.medColor, choroSettings.maxColor]).domain(fillDomain);
                // We use the old property function syntax here because the data-join technique is faster to parse still than expressions with this method
                const vectorProperty = choroSettings.getVectorProperty();
                let colors = {type: "categorical", property: vectorProperty, default: "rgba(0,0,0,0)", stops: []};
                let outlineColors = {type: "categorical", property: vectorProperty, default: "rgba(0,0,0,0)", stops: []};
                let filter = ['in', vectorProperty]
                features.choroplethData.map( row => {
                    let color: any = colorStops(row[roleMap.color]);
                    let outlineColor: any = colorStops(row[roleMap.color]);
                    outlineColor = outlineColor.darken(2);
                    colors.stops.push([row[roleMap.location], color.toString()]);
                    filter.push(row[roleMap.location]);
                    outlineColors.stops.push([row[roleMap.location], outlineColor.toString()]);
                });

                map.setPaintProperty('choropleth-layer', 'fill-color', colors);
                map.setPaintProperty('choropleth-layer', 'fill-outline-color', 'rgba(0,0,0,0.05)');
                map.setFilter('choropleth-layer', filter);
                map.setLayerZoomRange('choropleth-layer', choroSettings.minZoom, choroSettings.maxZoom);
            }
        }
    }
}
