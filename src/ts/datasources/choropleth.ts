module powerbi.extensibility.visual.data {

    export class Choropleth extends Datasource {
        private choroplethData: any[];
        private fillColorLimits: mapboxUtils.Limits;

        constructor() {
            super('choropleth-source');
        }

        addSources(map, settings: MapboxSettings) {
            map.addSource(this.ID, {
                type: 'vector',
                url: settings.choropleth[`vectorTileUrl${settings.choropleth.currentLevel}`],
            });
            return map.getSource(this.ID);
        }

        removeSources(map) {
            map.removeSource(this.ID);
        }

        ensure(map, layerId, settings): void {
            super.ensure(map, layerId, settings)
            const source: any = map.getSource(this.ID);
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
