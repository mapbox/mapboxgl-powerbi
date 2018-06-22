module powerbi.extensibility.visual.data {

    export abstract class Datasource {
        protected bounds: any[];
        private references: Object;
        public ID: string;
        private counter: any;

        constructor(id) {
            this.references = {}
            this.ID = id
            this.counter = 0
        }

        abstract addSources(map, settings);
        abstract removeSources(map);


        addToMap(map, settings) {
            console.log('--ADD to MAP FROM DATASOURCE--')
            this.addSources(map, settings)
        }

        removeFromMap(map, layerId) {
            delete this.references[layerId]
            if (Object.keys(this.references).length == 0) {
                this.removeSources(map)
            }
        }

        ensure(map, layerId, settings): void {
            this.references[layerId] = true;
        }

        update(map, features, roleMap, settings) {
            console.log('--CALLING UPDATE FROM DATASOURCE--')
        }
        getBounds() : any[] { return this.bounds }
        getLimits() : any { return null }
        handleZoom(map, settings) : boolean {
            return false;
        }
        getData(map, settings) : any[] { return null }
    }
}


