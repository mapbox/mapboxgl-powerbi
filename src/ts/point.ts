module powerbi.extensibility.visual {
    declare var turf : any;

    export abstract class Point extends Layer {
        protected colorLimits: mapboxUtils.Limits;
        protected sizeLimits: mapboxUtils.Limits;
        protected bounds: any[];

        constructor(map: MapboxMap) {
            super(map)
        }

        updateSource(features, roleMap) {
            const map = this.parent.getMap();
            let source: any = map.getSource('data');
            const featureCollection = turf.helpers.featureCollection(features);
            source.setData(featureCollection);
            this.colorLimits = mapboxUtils.getLimits(features, roleMap.color ? roleMap.color.displayName : '');
            this.sizeLimits = mapboxUtils.getLimits(features, roleMap.size ? roleMap.size.displayName : '');
            this.bounds = turf.bbox(featureCollection);
        }

        getBounds() : any[] {
            return this.bounds;
        }
    }
}



