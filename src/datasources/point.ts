import { Datasource } from "./datasource"
import { Limits, getLimits } from "../mapboxUtils"
import { featureCollection } from "@turf/helpers"
import bbox from "@turf/bbox"

export class Point extends Datasource {
    protected colorLimits: Limits;
    protected sizeLimits: Limits;

    constructor() {
        super('point')

        this.colorLimits = { min: null, max: null, values: [] }
        this.sizeLimits = { min: null, max: null, values: [] }
    }

    addSources(map, settings) {
        map.addSource('data', {
            type: 'geojson',
            data: featureCollection([]),
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
        const fCollection = featureCollection(features);
        const source: any = map.getSource('data');
        source.setData(fCollection);
        const colorCol = roleMap.getColumn('color', 'circle')
        if (colorCol) {
            this.colorLimits = getLimits(features, colorCol.displayName); // TODO
        }
        this.sizeLimits = getLimits(features, roleMap.size());
        this.bounds = bbox(fCollection);
    }
}
