module powerbi.extensibility.visual.data {
    declare var turf : any;

    export class Point extends Datasource {

        constructor() {
            super()
        }

        addSources(map) {
            map.addSource('data', {
                type: 'geojson',
                data: turf.helpers.featureCollection([]),
                buffer: 0
            });
            return map.getSource('data');
        }

        removeSources(map) {
            map.removeSource('data');
        }

        ensure(map, layerId) {
            super.ensure(map, layerId)
            const source: any = map.getSource('data');
            if (!source) {
                this.addToMap(map);
            }
            return this;
        }

        update(map, features, roleMap) {
            super.update(map, features, roleMap)
            const featureCollection = turf.helpers.featureCollection(features);
            const source: any = map.getSource('data');
            source.setData(featureCollection);
            this.bounds = turf.bbox(featureCollection);
        }

    }
}

