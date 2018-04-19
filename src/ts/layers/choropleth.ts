module powerbi.extensibility.visual {

    export class Choropleth extends Layer {
        private static ID = 'choropleth'
        private vectorTileUrl: string = "";

        constructor(map: MapboxMap) {
            super(map)
            this.id = Choropleth.ID;
            this.source = data.Sources.Choropleth;
        }

        addLayer(settings, beforeLayerId) {
            const map = this.parent.getMap();
            const choroplethLayer = mapboxUtils.decorateLayer({
                id: Choropleth.ID,
                type: "fill",
                source: 'choropleth-source',
                "source-layer": settings.choropleth.sourceLayer
            });
            map.addLayer(choroplethLayer, beforeLayerId);
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

        getSource(settings, map) {
            if (settings.choropleth.show) {
                if (this.vectorTileUrl != settings.choropleth.vectorTileUrl) {
                    if (this.vectorTileUrl) {
                        this.removeLayer()
                    }
                    this.vectorTileUrl = settings.choropleth.vectorTileUrl;
                }
            }
            return super.getSource(settings, map);
        }

        applySettings(settings, roleMap) {
            super.applySettings(settings, roleMap);
            const map = this.parent.getMap();
            if (map.getLayer(Choropleth.ID)) {
                map.setLayoutProperty(Choropleth.ID, 'visibility', settings.choropleth.display() ? 'visible' : 'none');
            }
            if (settings.choropleth.display()) {
                // The choropleth layer is different since it is a vector tile source, not geojson.  We can't modify it in-place.
                // If it is, we'll create the vector tile source from the URL.  If not, we'll make sure the source doesn't exist.
                const fillColorLimits = this.source.getLimits();

                let isGradient = mapboxUtils.shouldUseGradient(roleMap.color, fillColorLimits);
                let fillClassCount = mapboxUtils.getClassCount(fillColorLimits);
                let fillDomain: any[] = mapboxUtils.getNaturalBreaks(fillColorLimits, fillClassCount);
                let colorStops = chroma.scale([settings.choropleth.minColor,settings.choropleth.medColor, settings.choropleth.maxColor]).domain(fillDomain);
                // We use the old property function syntax here because the data-join technique is faster to parse still than expressions with this method
                let colors = {type: "categorical", property: settings.choropleth.vectorProperty, default: "rgba(0,0,0,0)", stops: []};
                let outlineColors = {type: "categorical", property: settings.choropleth.vectorProperty, default: "rgba(0,0,0,0)", stops: []};
                let filter = ['in', settings.choropleth.vectorProperty]
                const choroplethData = this.source.getData(map, settings)
                choroplethData.map( row => {
                    let color : any = colorStops(row[roleMap.color.displayName]);
                    let outlineColor : any = colorStops(row[roleMap.color.displayName])
                    outlineColor = outlineColor.darken(2);
                    colors.stops.push([row[roleMap.location.displayName], color.toString()]);
                    filter.push(row[roleMap.location.displayName]);
                    outlineColors.stops.push([row[roleMap.location.displayName], outlineColor.toString()]);
                });

                map.setPaintProperty(Choropleth.ID, 'fill-color', colors);
                map.setPaintProperty(Choropleth.ID, 'fill-outline-color', 'rgba(0,0,0,0.05)');
                map.setFilter(Choropleth.ID, filter);
                map.setLayerZoomRange(Choropleth.ID, settings.choropleth.minZoom, settings.choropleth.maxZoom);
                
 
            }
        }
    }
}
