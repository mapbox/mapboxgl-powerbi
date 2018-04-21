module powerbi.extensibility.visual.data {

    export abstract class Datasource {
        protected bounds: any[];
        private references: Object;

        constructor() {
            this.references = {}
        }

        abstract addSources(map, settings);
        abstract removeSources(map);


        addToMap(map, settings) {
            this.addSources(map, settings)
        }

        removeFromMap(map, layerId) {
            delete this.references[layerId]
            if (Object.keys(this.references).length == 0) {
                this.removeSources(map)
            }
        }

        ensure(map, layerId, settings) {
            this.references[layerId] = true;
        }

        update(map, features, roleMap, settings) {}
        getBounds() : any[] { return this.bounds }
        getLimits() : any { return null }
        handleZoom(map, settings) {}
        getData(map, settings) : any[] { return null }
    }
}


