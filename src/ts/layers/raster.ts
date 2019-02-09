module powerbi.extensibility.visual {
    declare var turf: any;

    export class Raster extends Layer {
        private static ID = 'raster';

        constructor(map: MapboxMap) {
            super(map)
            this.id = 'raster'
            this.source = data.Sources.Raster
        }

        getLayerIDs() {
            return ['raster'];
        }

        addLayer(settings, beforeLayerId) {
            const map = this.parent.getMap();
            const rasterLayer = mapboxUtils.decorateLayer({
                id: 'raster',
                source: 'raster',
                type: 'raster',
                paint: {
                    'raster-opacity': 0.80
                }
            });
            map.addLayer(rasterLayer, beforeLayerId);
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

