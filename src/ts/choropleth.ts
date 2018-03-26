module powerbi.extensibility.visual {

    export class Choropleth {
        private parent: MapboxMap;
        private static ID = 'choropleth'
        private vectorTileUrl: string = "";

        constructor(map: MapboxMap) {
            this.parent = map
        }

        addLayer(beforeLayerId) {
        }

        applySettings(features, settings) {
            const map = this.parent.getMap();
            if (map.getLayer('choropleth-layer')) {
                map.setLayoutProperty('choropleth-layer', 'visibility', settings.choropleth.display() ? 'visible' : 'none');
            }
            if (settings.choropleth.display()) {
                if (this.vectorTileUrl != settings.choropleth.vectorTileUrl) {
                    if (map.getSource('choropleth-source')) {
                        if (map.getLayer('choropleth-layer')) {
                            map.removeLayer('choropleth-layer');
                        }
                        map.removeSource('choropleth-source');
                    }
                    this.vectorTileUrl = settings.choropleth.vectorTileUrl;
                }

                if (!map.getSource('choropleth-source')) {
                    map.addSource('choropleth-source', {
                        type: 'vector',
                        url: settings.choropleth.vectorTileUrl,
                    });
                }

                const choroplethLayer = mapboxUtils.decorateLayer({
                    id: 'choropleth-layer',
                    type: "fill",
                    source: 'choropleth-source',
                    "source-layer": settings.choropleth.sourceLayer
                });

                if (!map.getLayer('choropleth-layer')) {
                    map.addLayer(choroplethLayer, 'cluster');
                }

                const limits = mapboxUtils.getLimits(features.choroplethData, 'colorValue');

                if (limits.min && limits.max) {
                    let colorStops = chroma.scale([settings.choropleth.minColor,settings.choropleth.maxColor]).domain([limits.min, limits.max]);
                    let colors = ['match', ['get', settings.choropleth.vectorProperty]];
                    let outlineColors = ['match', ['get', settings.choropleth.vectorProperty]];

                    features.choroplethData.map( row => {
                        const color = colorStops(row.properties.colorValue);
                        var outlineColor : any = colorStops(row.properties.colorValue)
                        outlineColor = outlineColor.darken(2);
                        colors.push(row.properties.location);
                        colors.push(color.toString());
                        outlineColors.push(row.properties.location);
                        outlineColors.push(outlineColor.toString());
                    });

                    // Add transparent as default so that we only see regions
                    // for which we have data values
                    colors.push('rgba(0,0,0,0)');
                    outlineColors.push('rgba(0,0,0,0)');

                    map.setPaintProperty('choropleth-layer', 'fill-color', colors);
                    map.setPaintProperty('choropleth-layer', 'fill-outline-color', outlineColors)
                    map.setLayerZoomRange('choropleth-layer', settings.choropleth.minZoom, settings.choropleth.maxZoom);
                }
            }
        }
    }
}
