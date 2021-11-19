import { Datasource } from "./datasource"

export class Raster extends Datasource {
    constructor() {
        super('wms')
    }

    addSources(map, settings) {
        map.addSource('raster', {
            type: 'raster',
            tiles: [
                settings.raster.url
            ],
            tileSize: settings.raster.rasterTileSize
        }, );
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
        super.update(map, features, roleMap, settings)
        const source: any = map.getSource('raster');
    }
}
