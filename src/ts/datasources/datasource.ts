module powerbi.extensibility.visual.data {
    declare var axios: any;

    export abstract class Datasource {
        protected bounds: any[];
        private references: Object;
        public ID: string;
        public timeSlice: string;

        constructor(id) {
            this.references = {}
            this.ID = id
            this.timeSlice = 'meow'

            axios.get("https://api.weather.com/v3/TileServer/series/productSet/PPAcore?apiKey=3f8ed76d96d94f1f8ed76d96d98f1fc0")
                .then(function (response) {
                    console.log('datasource axios response', response.data)

                })

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

        ensure(map, layerId, settings): void {
            this.references[layerId] = true;
        }

        update(map, features, roleMap, settings) {}
        getBounds() : any[] { return this.bounds }
        getLimits() : any { return null }
        handleZoom(map, settings) : boolean {
            return false;
        }
        getData(map, settings) : any[] { return null }
    }
}


