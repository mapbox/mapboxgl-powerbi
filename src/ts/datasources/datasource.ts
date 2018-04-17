module powerbi.extensibility.visual.data {

    export abstract class Datasource {
        protected bounds: any[];
        private references: Object;

        constructor() {
            this.references = {}
        }

        abstract addSources(map);
        abstract removeSources(map);


        addToMap(map) {
            this.addSources(map)
        }

        removeFromMap(map, layerId) {
            delete this.references[layerId]
            if (Object.keys(this.references).length == 0) {
                this.removeSources(map)
            }
        }

        ensure(map, layerId) {
            this.references[layerId] = true;
        }

        update(map, features, roleMap, settings) {}
        getBounds() : any[] { return this.bounds }
        getLimits() : any { return null }
        handleZoom(map, settings) {}
    }
}


