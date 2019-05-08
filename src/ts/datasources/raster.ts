module powerbi.extensibility.visual.data {
    declare var axios: any

    export class Raster extends Datasource {
        // protected colorLimits: mapboxUtils.Limits;
        // protected sizeLimits: mapboxUtils.Limits;
        private timeSliceSource: string

        constructor() {
            super('wms')
            // this.timeSliceSource = timeSlice
        }


        addSources(map, settings) {
            
                    map.addSource('raster', {
                        type: 'raster',
                        tiles: [
                            settings.raster.url
                        ],
                        tileSize: settings.raster.rasterTileSize
                    });
        }

        removeSources(map) {
            map.removeSource('raster');
            map.removeSource('weather');
        }


        ensure(map, layerId, settings): void {
            super.ensure(map, layerId, settings)
            const source: any = map.getSource('raster');
            // const source2: any = map.getSource('weather');
            if (!source) {
                this.addToMap(map, settings);
            }
        }

        update(map, features, roleMap, settings) {
            super.update(map, features, roleMap, settings)
            const source: any = map.getSource('raster');
        }
    }
}
