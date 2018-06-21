module powerbi.extensibility.visual.data {

    export class Choropleth extends Datasource {
        private choroplethData: any[];
        private fillColorLimits: mapboxUtils.Limits;

        constructor() {
            super('choropleth');
        }

        addSources(map, settings) {
            map.addSource('choropleth-source', {
                type: 'vector',
                url: settings.choropleth[`vectorTileUrl${settings.choropleth.currentLevel}`],
            });
            return map.getSource('choropleth-source');
        }

        removeSources(map) {
            map.removeSource('choropleth-source');
        }

        ensure(map, layerId, settings): void {
            super.ensure(map, layerId, settings)
            const source: any = map.getSource('choropleth-source');
            if (!source) {
                this.addToMap(map, settings);
            }
        }

        getLimits() {
            return this.fillColorLimits;
        }

        getData(map, settings) : any[] {
            return this.choroplethData;
        }

        update(map, features, roleMap, settings) {
            super.update(map, features, roleMap, settings)

            this.choroplethData = features.map(f => f.properties);
            this.fillColorLimits = mapboxUtils.getLimits(this.choroplethData, roleMap.color ? roleMap.color.displayName : '');
        }
    }
}
