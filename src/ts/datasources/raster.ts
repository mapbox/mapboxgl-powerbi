module powerbi.extensibility.visual.data {
    declare var turf : any;

    export class Raster extends Datasource {
        protected colorLimits: mapboxUtils.Limits;
        protected sizeLimits: mapboxUtils.Limits;

        constructor() {
            super()
            console.log('testing datasource')
        }

        addSources(map, settings) {
            console.log('testing addsources in datasource')
            map.addSource('raster', {
                'type': 'raster',
                'tiles': [
                    'https://geodata.state.nj.us/imagerywms/Natural2015?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&width=256&height=256&layers=Natural2015'
                ],
                'tileSize': 256
            },);
            return map.getSource('raster');
        }

        removeSources(map) {
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
