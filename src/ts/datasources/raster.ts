module powerbi.extensibility.visual.data {
    declare var turf : any;

    export class Raster extends Datasource {
        // protected colorLimits: mapboxUtils.Limits;
        // protected sizeLimits: mapboxUtils.Limits;

        constructor() {
            super()
            console.log('testing datasource')
        }

        addSources(map, settings) {
            console.log('testing add source for raster')
            console.log(settings)
            map.addSource('raster', {
                type: 'raster',
                tiles: [
                    settings.raster.url
                ],
                tileSize: 512
            },);
            console.log('returning the source for raster')
            return map.getSource('raster');
        }

        removeSources(map) {
            console.log('removing source')
            map.removeSource('raster');
        }


        ensure(map, layerId, settings): void {
            super.ensure(map, layerId, settings)
            const source: any = map.getSource('raster');
            if (!source) {
                this.addToMap(map, settings);
            }
        }

        update(map, features, roleMap, settings) {
            console.log('calling update')
            super.update(map, features, roleMap, settings)
            const source: any = map.getSource('raster');
        }
    }
}
