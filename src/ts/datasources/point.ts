module powerbi.extensibility.visual.data {
    declare var turf : any;

    export class Point extends Datasource {
        protected colorLimits: mapboxUtils.Limits;
        protected sizeLimits: mapboxUtils.Limits;

        constructor() {
            super('point')
        }

        addSources(map, settings) {
            map.addSource('data', {
                type: 'geojson',
                data: turf.helpers.featureCollection([]),
                buffer: 10
            });
            return map.getSource('data');
        }

        removeSources(map) {
            map.removeSource('data');
        }

        getLimits() {
            return {
                color: this.colorLimits,
                size: this.sizeLimits,
            };
        }

        ensure(map, layerId, settings): void {
            super.ensure(map, layerId, settings)
            const source: any = map.getSource('data');
            if (!source) {
                this.addToMap(map, settings);
            }
        }

        update(map, features, roleMap, settings) {
            super.update(map, features, roleMap, settings)
            const featureCollection = turf.helpers.featureCollection(features);
            const source: any = map.getSource('data');
            source.setData(featureCollection);
            this.colorLimits = mapboxUtils.getLimits(features, roleMap.color ? roleMap.color.displayName : '');
            this.sizeLimits = mapboxUtils.getLimits(features, roleMap.size ? roleMap.size.displayName : '');
            this.bounds = turf.bbox(featureCollection);
        }
    }
}
