module powerbi.extensibility.visual.data {
    declare var turf: any;

    export class BBoxCache {
        private cache: {}
        private usedSourceId: string
        private usedSettings: ChoroplethSettings

        public getBBox(featureNames: string[]): number[] {
            const features = featureNames.map(featureName => this.cache[featureName])
                                         .filter(feature => feature != null)
            if (!features.length) {
                return null
            }
            const featureCollection = turf.helpers.featureCollection(features)
            return turf.bbox(featureCollection)
        }

        public update(map: mapboxgl.Map, sourceId: string, settings: ChoroplethSettings) {
            if (this.hasSourceChanged(sourceId, settings)) {
                this.reset(map, sourceId, settings)
            }
            else {
                this.updateCache(map)
            }
        }

        private hasSourceChanged(sourceId: string, settings: ChoroplethSettings) {
            if (this.usedSourceId != sourceId) {
                return true
            }

            if (settings.hasChanged(this.usedSettings)) {
                return true
            }

            return false
        }

        private reset(map: mapboxgl.Map, sourceId: string, settings: ChoroplethSettings) {
            this.cache = {}
            this.usedSourceId = sourceId
            this.usedSettings = settings

            map.zoomTo(0, { animate: false })
            this.updateCache(map)
        }

        private updateCache(map: mapboxgl.Map) {
            const vectorPropertyName = this.usedSettings.getCurrentVectorProperty()
            const sourceFeaturesByName = map.querySourceFeatures(this.usedSourceId, { sourceLayer: this.usedSettings.getCurrentSourceLayer() })
                .reduce((result, feature) => {
                    if (!feature) {
                        return result
                    }

                    const featureName = feature.properties[vectorPropertyName]

                    if (!result[featureName]) {
                        result[featureName] = []
                    }
                    result[featureName].push(feature)

                    return result
                }, {})

            Object.keys(sourceFeaturesByName).forEach((featureName) => {
                // NOTE: hardcode Alaska bounding box, as Alaska is spreading over the meridian, thus its bounding box
                // would result in an entire world-like bounds.
                if (featureName == 'Alaska' && this.usedSettings.getCurrentVectorTileUrl() == ChoroplethSettings.US_STATES_TILE_URL) {
                    this.cache[featureName] = turf.bboxPolygon([-168.121, 54.764, -129.994, 71.39]);
                    return;
                }

                const featureArray = sourceFeaturesByName[featureName]
                const cachedFeaturePolygon = this.cache[featureName]
                if (cachedFeaturePolygon) {
                    featureArray.push(cachedFeaturePolygon)
                }
                const featureCollection = turf.helpers.featureCollection(featureArray)
                const newFeaturePolygon = turf.bboxPolygon(turf.bbox(featureCollection))
                this.cache[featureName] = newFeaturePolygon
            })
        }
    }
}
