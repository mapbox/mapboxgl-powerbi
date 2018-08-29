module powerbi.extensibility.visual.data {

    export class Choropleth extends Datasource {
        private choroplethData: any[];
        private fillColorLimits: mapboxUtils.Limits;
        private bboxCache: BBoxCache;

        constructor() {
            super('choropleth-source');
            this.bboxCache = new BBoxCache()
        }

        addSources(map, settings: MapboxSettings) {
            map.addSource(this.ID, {
                type: 'vector',
                url: settings.choropleth.getCurrentVectorTileUrl(),
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

        getData(map, settings): any[] {
            return this.choroplethData;
        }

        update(map, features, roleMap, settings: MapboxSettings) {
            super.update(map, features, roleMap, settings)
            this.choroplethData = features.map(f => f.properties)
            this.fillColorLimits = mapboxUtils.getLimits(this.choroplethData, roleMap.color ? roleMap.color.displayName : '')
            const featureNames = this.choroplethData.map(f => f[roleMap.location.displayName])

            // NOTE: this is a workaround because 'load' event of mapbox is missing sometimes. And 
            // even if it is triggered, sometimes querySourceFeatures() returns an empty set. This
            // is why we are polling until we get the bounds of the desired features.
            if (settings.api.autozoom) {
                const pollStart = Date.now();
                let bboxInit = setInterval( () => {
                    // Stop polling after 5 seconds
                    if (Date.now() - pollStart > 5000) {
                        clearInterval(bboxInit);
                        console.log('Failed to get the bounding box of the desired features. Abort polling.')
                        return;
                    }

                    this.bboxCache.update(map, this.ID, settings.choropleth);
                    this.bounds = this.bboxCache.getBBox(featureNames);

                    if (this.bounds == null) {
                        // Wait a bit more until we get the bounding box for the desired features
                        return;
                    }

                    mapboxUtils.zoomToData(map, this.bounds);
                    clearInterval(bboxInit);
                }, 300);
            }
        }
    }
}
