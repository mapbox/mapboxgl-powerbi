module powerbi.extensibility.visual {
    export abstract class Layer {
        protected parent: MapboxMap;

        constructor(map: MapboxMap) {
            this.parent = map;
        }

        abstract applySettings(settings, roleMap);
        abstract updateSource(features, roleMap, settings);
        abstract getBounds() : any[];

        addLayer(settings, beforeLayerId : string) {
        }

        handleZoom(settings) {
        }

    }
}


