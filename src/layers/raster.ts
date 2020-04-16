module powerbi.extensibility.visual {
    declare var turf: any;

    export class Raster extends Layer {
        private static readonly ID = 'raster';
        private static readonly LayerOrder = [Raster.ID];

        constructor(map: MapboxMap) {
            super(map)
            this.id = 'raster'
            this.source = data.Sources.Raster
        }

        getLayerIDs() {
            return [Raster.ID];
        }

        addLayer(settings, beforeLayerId) {
            const map = this.parent.getMap();
            const layers = {};
            layers[Raster.ID] = mapboxUtils.decorateLayer({
                id: Raster.ID,
                source: 'raster',
                type: 'raster',
                paint: {
                    'raster-opacity': 1
                }
            });
            Raster.LayerOrder.forEach((layerId) => map.addLayer(layers[layerId], beforeLayerId));
        }

        removeLayer() {
            const map = this.parent.getMap();
            map.removeLayer('raster');
            this.source.removeFromMap(map, 'raster');
        }

        applySettings(settings, roleMap) {
            super.applySettings(settings, roleMap);
            const map = this.parent.getMap();
            if (settings.raster.show) {
                map.setPaintProperty(Raster.ID, 'raster-opacity', settings.raster.opacity / 100);
                map.setLayerZoomRange(Raster.ID, settings.raster.minZoom, settings.raster.maxZoom);
            }
        }

    }

}

