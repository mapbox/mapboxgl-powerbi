module powerbi.extensibility.visual {
    declare var turf : any;

    export class Raster extends Layer {
        private static ID = 'raster';

        constructor(map: MapboxMap) {
            super(map)
            this.id = 'raster'
            this.source = data.Sources.Raster
        }

        getLayerIDs() {
            return [ 'raster' ];
        }

        addLayer(settings, beforeLayerId) {
            const map = this.parent.getMap();
            const rasterLayer = mapboxUtils.decorateLayer({
                id: 'raster',
                source: 'raster',
                type: 'raster'
            });
            map.addLayer(rasterLayer, 'water');
        }

        removeLayer() {
            const map = this.parent.getMap();
            map.removeLayer('raster');
            this.source.removeFromMap(map, 'raster');
        }

        applySettings(settings, roleMap) {
            super.applySettings(settings, roleMap);
        }

    }

}

