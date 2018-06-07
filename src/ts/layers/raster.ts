module powerbi.extensibility.visual {
    declare var turf : any;

    export class Raster extends Layer {
        private static ID = 'raster';

        constructor(map: MapboxMap) {
            super(map)
            this.id = Raster.ID
            this.source = data.Sources.Point
            console.log('testing layer')
        }

        getLayerIDs() {
            return [ Raster.ID ];
        }

        addLayer(settings, beforeLayerId) {
            console.log('adding layer for raster')
            const map = this.parent.getMap();
            const rasterLayer = mapboxUtils.decorateLayer({
                id: 'raster',
                source: 'raster',
                type: 'raster'
            });
            map.addLayer(rasterLayer, beforeLayerId);
        }

        removeLayer() {
            const map = this.parent.getMap();
            map.removeLayer(Raster.ID);
            this.source.removeFromMap(map, Raster.ID);
        }

        applySettings(settings, roleMap) {
            super.applySettings(settings, roleMap);
        }

    }

}

