module powerbi.extensibility.visual.data {

    export class Choropleth extends Datasource {
        private choroplethData: any[];
        private fillColorLimits: mapboxUtils.Limits;
        private bboxCache: BBoxCache;

        private static readonly BBOX_TIMEOUT = 5000

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

            // NOTE: this is a workaround because 'sourcedata' event of mapbox is received multiple times
            // with isSourceLoaded being true. And then sometimes querySourceFeatures() returns an empty set.
            // This is why we are waiting until we get the bounds of the desired features.
            if (settings.api.autozoom) {
                const start = Date.now()
                let sourceLoaded = (e) => {
                    if (Date.now() - start > Choropleth.BBOX_TIMEOUT) {
                        map.off('sourcedata', sourceLoaded)

                        const source = map.getSource(this.ID)
                        this.bounds = source.bounds
                        console.log('Waiting for getting bounds of desired features has timed out. Zooming to source bounds:', this.bounds)
                        mapboxUtils.zoomToData(map, this.bounds)
                        return
                    }
                    if (e.sourceId == this.ID) {
                        this.bboxCache.update(map, this.ID, settings.choropleth)
                        this.bounds = this.bboxCache.getBBox(featureNames)
                        if (this.bounds == null) {
                            // Wait a bit more until we get the bounding box for the desired features
                            return
                        }
                        map.off('sourcedata', sourceLoaded)
                        mapboxUtils.zoomToData(map, this.bounds)
                    }
                }

                this.bboxCache.update(map, this.ID, settings.choropleth)
                this.bounds = this.bboxCache.getBBox(featureNames)
                if (this.bounds == null) {
                    // Source must be still loading wait for it to finish
                    map.on('sourcedata', sourceLoaded)
                }
            }
        }
    }
}
