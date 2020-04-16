module powerbi.extensibility.visual.data {
    declare var turf : any;
    declare var supercluster: any;

    export class Cluster extends Datasource {
        private cluster: any;
        private getClusterField: Function;
        public limits: mapboxUtils.Limits;

        constructor() {
            super('cluster')
            this.cluster = this.createCluster();
        }

        withGetter(getClusterField) {
            this.getClusterField = getClusterField;
            return this;
        }

        addSources(map, settings) {
            map.addSource('clusterData', {
                type: 'geojson',
                data: turf.helpers.featureCollection([]),
                buffer: 10
            });
            return map.getSource('clusterData');
        }

        removeSources(map) {
            map.removeSource('clusterData');
            this.cluster.load([]);
        }

        getLimits() {
            return this.limits
        }

        ensure(map, layerId, settings): void {
            super.ensure(map, layerId, settings)
            const source: any = map.getSource('clusterData');
            if (!source) {
                this.addToMap(map, settings);
            }
        }

        update(map, features, roleMap, settings) {
            super.update(map, features, roleMap, settings)
            const source: any = map.getSource('clusterData');
            this.cluster.load(features);
            this.handleZoom(map, settings)
            const featureCollection = turf.helpers.featureCollection(features);
            this.bounds = turf.bbox(featureCollection);
        }

        handleZoom(map, settings) : boolean {
            const source: any = map.getSource('clusterData');
            const clusterData = this.getData(map, settings.cluster);
            source.setData(turf.helpers.featureCollection(clusterData));
            this.limits = mapboxUtils.getLimits(clusterData, settings.cluster.aggregation);
            return true;
        }


        createCluster() {
            const self = this
            return supercluster({
                radius: 50,
                maxZoom: 12,
                initial: function() {
                    return {
                        Count: 0,
                        Sum: 0,
                        Minimum: Infinity,
                        Maximum: -Infinity,
                        Average: 0.0,
                    };
                },
                map: function(properties) {
                    const clusterField = self.getClusterField();
                    const Count = 1;
                    const Sum = Number(properties[clusterField]);
                    const Minimum = Number(properties[clusterField]);
                    const Maximum = Number(properties[clusterField]);
                    const Average = Number(properties[clusterField]);
                    const obj = {
                        Count,
                        Sum,
                        Minimum,
                        Maximum,
                        Average
                    }
                    return {
                        Count,
                        Sum,
                        Minimum,
                        Maximum,
                        Average,
                    };
                },
                reduce: function(accumulated, properties) {
                    accumulated.Sum += roundToDecimals(properties.Sum, 2)
                    accumulated.Count += properties.Count
                    accumulated.Minimum = roundToDecimals(Math.min(accumulated.Minimum, properties.Minimum), 2)
                    accumulated.Maximum = roundToDecimals(Math.max(accumulated.Maximum, properties.Maximum), 2)
                    accumulated.Average = roundToDecimals(accumulated.Sum / accumulated.Count, 2)
                }
            });
        }

        getData(map, settings) : any[] {
            this.cluster.options.radius = settings.clusterRadius;
            this.cluster.options.maxZoom = settings.clusterMaxZoom;
            return this.cluster.getClusters(constants.WORLD_BOUNDS, Math.floor(map.getZoom()) ).
                map( feature => {
                    // Remove built-in  properties
                    // as they are not needed and are ruining our tooltips
                    delete feature.properties.cluster;
                    delete feature.properties.cluster_id;
                    delete feature.properties.point_count;
                    delete feature.properties.point_count_abbreviated;
                    return feature;
                });
        }
    }

    function roundToDecimals(value, decimals) {
        const tenPow = Math.pow(10, decimals)
        return Math.round(value * tenPow) / tenPow
    }
}
