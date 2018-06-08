module powerbi.extensibility.visual {
    declare var turf : any;

    export class Raster extends Layer {
        private static ID = 'raster';

        constructor(map: MapboxMap) {
            super(map)
            this.id = 'raster'
            this.source = data.Sources.Raster
            console.log('testing layerrrr')
        }

        getLayerIDs() {
            return [ 'raster' ];
        }

        addLayer(settings, beforeLayerId) {
            console.log('adding layer for raster')
            const map = this.parent.getMap();
            const rasterLayer = mapboxUtils.decorateLayer({
                id: 'raster',
                source: 'raster',
                type: 'raster'
            });
            console.log('before layer id')
            console.log(beforeLayerId)
            map.addLayer(rasterLayer, 'waterway-label');
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

