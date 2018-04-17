module powerbi.extensibility.visual {

    export abstract class Point extends Layer {
        protected colorLimits: mapboxUtils.Limits;
        protected sizeLimits: mapboxUtils.Limits;

        constructor(map: MapboxMap) {
            super(map)
            this.source = data.Sources.Point
        }

        updateSource(features, roleMap, settings) {
            super.updateSource(features, roleMap, settings)
            this.colorLimits = mapboxUtils.getLimits(features, roleMap.color ? roleMap.color.displayName : '');
            this.sizeLimits = mapboxUtils.getLimits(features, roleMap.size ? roleMap.size.displayName : '');
        }

        getBounds() : any[] {
            return this.source.getBounds()
        }
    }
}



