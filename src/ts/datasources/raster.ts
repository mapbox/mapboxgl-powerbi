module powerbi.extensibility.visual.data {
    declare var axios: any

    export class Raster extends Datasource {
        // protected colorLimits: mapboxUtils.Limits;
        // protected sizeLimits: mapboxUtils.Limits;

        constructor() {
            super('wms')
        }

        // axios.get("https://test.com")
        // .then(function(response) {
        //     console.log('hello')
        // })

        addSources(map, settings) {
            map.addSource('raster', {
                type: 'raster',
                tiles: [
                    settings.raster.url
                ],
                tileSize: settings.raster.rasterTileSize
            }, );

            map.addSource('weather', {
                type: 'raster',
                tiles: [
                    "https://api.weather.com/v3/TileServer/tile/radar?ts=1557261300&xyz={x}:{y}:{z}&apiKey=3f8ed76d96d94f1f8ed76d96d98f1fc0"
                ],
                tileSize: 256
            }, );

            console.log(map.getSource('weather'))
       
            // return map.getSource('raster');
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
            // if (!source2) {
            //     this.addToMap(map, settings);
            // }
        }

        update(map, features, roleMap, settings) {
            super.update(map, features, roleMap, settings)
            const source: any = map.getSource('raster');
            // const source2: any = map.getSource('weather');
        }
    }
}
