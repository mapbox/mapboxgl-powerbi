module powerbi.extensibility.visual {

    export class Choropleth extends Layer {
        private static ID = 'choropleth'
        private vectorTileUrl: string = "";
        private fillColorLimits: mapboxUtils.Limits;
        private choroplethData: any[];

        constructor(map: MapboxMap) {
            super(map)
        }

        updateSource(features, roleMap, settings) {
            const map = this.parent.getMap();
            this.choroplethData = features.map(f => f.properties);
            this.fillColorLimits = mapboxUtils.getLimits(this.choroplethData, roleMap.color ? roleMap.color.displayName : '');
            if (this.vectorTileUrl != settings.choropleth.vectorTileUrl) {
                // Update the vector tile source if it exists and has changed.
                if (map.getSource('choropleth-source')) {
                    if (map.getLayer('choropleth-layer')) {
                        map.removeLayer('choropleth-layer');
                    }
                    map.removeSource('choropleth-source');
                }
                this.vectorTileUrl = settings.choropleth.vectorTileUrl;
            }

            if (!map.getSource('choropleth-source')) {
                // Create the vector tile source if it doesn't yet exist
                map.addSource('choropleth-source', {
                    type: 'vector',
                    url: settings.choropleth.vectorTileUrl,
                });
            }
        }

        removeLayer() {
            const map = this.parent.getMap();
            map.removeLayer(Choropleth.ID);
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

        applySettings(settings, roleMap) {
            const map = this.parent.getMap();
            if (map.getLayer('choropleth-layer')) {
                map.setLayoutProperty('choropleth-layer', 'visibility', settings.choropleth.display() ? 'visible' : 'none');
            }
            if (settings.choropleth.display()) {
                // The choropleth layer is different since it is a vector tile source, not geojson.  We can't modify it in-place.
                // If it is, we'll create the vector tile source from the URL.  If not, we'll make sure the source doesn't exist.

                const choroplethLayer = mapboxUtils.decorateLayer({
                    id: 'choropleth-layer',
                    type: "fill",
                    source: 'choropleth-source',
                    "source-layer": settings.choropleth.sourceLayer
                });

                if (!map.getLayer('choropleth-layer')) {
                    // add the choropleth layer if it doesn't exist
                    map.addLayer(choroplethLayer, 'cluster');
                }

                let isGradient = mapboxUtils.shouldUseGradient(roleMap.color, this.fillColorLimits);
                let fillClassCount = mapboxUtils.getClassCount(this.fillColorLimits);
                let fillDomain: any[] = mapboxUtils.getNaturalBreaks(this.fillColorLimits, fillClassCount);
                let colorStops = chroma.scale([settings.choropleth.minColor,settings.choropleth.medColor, settings.choropleth.maxColor]).domain(fillDomain);
                // We use the old property function syntax here because the data-join technique is faster to parse still than expressions with this method
                let colors = {type: "categorical", property: settings.choropleth.vectorProperty, default: "rgba(0,0,0,0)", stops: []};
                let outlineColors = {type: "categorical", property: settings.choropleth.vectorProperty, default: "rgba(0,0,0,0)", stops: []};
                let filter = ['in', settings.choropleth.vectorProperty]
                this.choroplethData.map( row => {
                    let color : any = colorStops(row[roleMap.color.displayName]);
                    let outlineColor : any = colorStops(row[roleMap.color.displayName])
                    outlineColor = outlineColor.darken(2);
                    colors.stops.push([row[roleMap.location.displayName], color.toString()]);
                    filter.push(row[roleMap.location.displayName]);
                    outlineColors.stops.push([row[roleMap.location.displayName], outlineColor.toString()]);
                });

                map.setPaintProperty('choropleth-layer', 'fill-color', colors);
                map.setPaintProperty('choropleth-layer', 'fill-outline-color', 'rgba(0,0,0,0.05)');
                map.setFilter('choropleth-layer', filter);
                map.setLayerZoomRange('choropleth-layer', settings.choropleth.minZoom, settings.choropleth.maxZoom);
                
 
            }
        }
    }
}
