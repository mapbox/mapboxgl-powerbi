module powerbi.extensibility.visual {
    declare var supercluster : any;

    export class Cluster {
        private parent: MapboxMap;
        private cluster: any;
        private static ID = 'cluster'
        private static LabelID = 'cluster-label'
        private static UnclusterID = 'uncluster'
        
        constructor(map: MapboxMap) {
            this.parent = map
            this.cluster = createCluster();
        }

        update(features) {
            this.cluster.load(features);
        }

        getData(settings) {
            const worldBounds = [-180.0000, -90.0000, 180.0000, 90.0000];
            const map = this.parent.getMap();
            this.cluster.options.radius = settings.cluster.clusterRadius;
            this.cluster.options.maxZoom = settings.cluster.clusterMaxZoom;
            return this.cluster.getClusters(worldBounds, Math.floor(map.getZoom()) );
        }

        addLayer(settings, beforeLayerId) {
            const map = this.parent.getMap();
            const clusterLayer = mapboxUtils.decorateLayer({
                id: Cluster.ID,
                source: 'clusterData',
                type: 'cluster',
                filter: ['has', 'count']
            });
            const unclusterLayer = mapboxUtils.decorateLayer({
                id: Cluster.UnclusterID,
                source: 'clusterData',
                type: 'cluster',
                filter: ['!has', 'count']
            });

            map.addLayer(clusterLayer, beforeLayerId);
            map.addLayer(unclusterLayer, beforeLayerId);

            const clusterLabelLayer = mapboxUtils.decorateLayer({
                id: Cluster.LabelID,
                type: 'symbol',
                source: 'clusterData',
                filter: ["has", "count"],
                layout: {
                    'text-field': `{${settings.cluster.aggregation}}`,
                    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                    'text-size': 12
                },
                paint: {
                    "text-halo-color": "white",
                    "text-halo-width": 1
                }
            });
            map.addLayer(clusterLabelLayer);
        }

        applySettings(features, settings) {
            const map = this.parent.getMap();
            map.setLayoutProperty('cluster', 'visibility', settings.cluster.show ? 'visible' : 'none');
            map.setLayoutProperty('uncluster', 'visibility', settings.cluster.show ? 'visible' : 'none');
            map.setLayoutProperty('cluster-label', 'visibility', settings.cluster.show ? 'visible' : 'none');
            if (settings.cluster.show) {
                map.setLayerZoomRange(Cluster.ID, settings.cluster.minZoom, settings.cluster.maxZoom);
                map.setPaintProperty(Cluster.ID, 'circle-stroke-width', settings.cluster.strokeWidth);
                map.setPaintProperty(Cluster.ID, 'circle-stroke-opacity', settings.cluster.strokeOpacity / 100);
                map.setPaintProperty(Cluster.ID, 'circle-stroke-color', settings.cluster.strokeColor);
                map.setPaintProperty(Cluster.ID, 'circle-blur', settings.cluster.blur/100);
                map.setLayerZoomRange(Cluster.LabelID, settings.cluster.minZoom, settings.cluster.maxZoom);
                map.setLayerZoomRange(Cluster.UnclusterID, settings.cluster.minZoom, settings.cluster.maxZoom);
                map.setPaintProperty(Cluster.UnclusterID, 'circle-stroke-width', settings.cluster.strokeWidth);
                map.setPaintProperty(Cluster.UnclusterID, 'circle-stroke-opacity', settings.cluster.strokeOpacity / 100);
                map.setPaintProperty(Cluster.UnclusterID, 'circle-stroke-color', settings.cluster.strokeColor);
                map.setPaintProperty(Cluster.UnclusterID, 'circle-color', settings.cluster.minColor);
                map.setPaintProperty(Cluster.UnclusterID, 'circle-radius', settings.cluster.radius/2);
                const limits = mapboxUtils.getLimits(features.clusterData, settings.cluster.aggregation);
                if (limits.min && limits.max) {
                    map.setPaintProperty(Cluster.ID, 'circle-color', [
                        'interpolate', ['linear'], ['get', settings.cluster.aggregation],
                        limits.min, settings.cluster.minColor,
                        limits.max, settings.cluster.maxColor
                    ]);

                    map.setPaintProperty(Cluster.ID, 'circle-radius', [
                        'interpolate', ['linear'], ['get', settings.cluster.aggregation],
                        limits.min, settings.cluster.radius,
                        limits.max, 3 * settings.cluster.radius,
                    ]);

                    map.setLayoutProperty(Cluster.LabelID, 'text-field', `{${settings.cluster.aggregation}}`);
                }
            }
        }
    }

    export function createCluster() {
        return supercluster({
            radius: 50,
            maxZoom: 12,
            initial: function() {
                return {
                    count: 0,
                    sum: 0,
                    min: Infinity,
                    max: -Infinity,
                    avg: 0.0,
                    tooltip: '',
                };
            },
            map: function(properties) {
                const count = 1;
                const sum = Number(properties["clusterValue"]);
                const min = Number(properties["clusterValue"]);
                const max = Number(properties["clusterValue"]);
                const avg = Number(properties["clusterValue"]);
                const obj = {
                    count,
                    sum,
                    min,
                    max,
                    avg
                }
                let propertyName = '';
                if (properties.tooltip) {
                    let tooltipData = JSON.parse(properties.tooltip);
                    propertyName = tooltipData.clusterField;
                }
                return {
                    count,
                    sum,
                    min,
                    max,
                    avg,
                    propertyName,
                    tooltip: JSON.stringify({
                        title: propertyName,
                        content: {
                            Sum: sum,
                            Count: count,
                            Min: min,
                            Max: max,
                            Avg: avg,
                        }
                    })
                };
            },
            reduce: function(accumulated, properties) {
                accumulated.sum += Math.round(properties.sum * 100) / 100;
                accumulated.count += properties.count;
                accumulated.min = Math.round(Math.min(accumulated.min, properties.min) * 100) / 100;
                accumulated.max = Math.round(Math.max(accumulated.max, properties.max) * 100) / 100;
                accumulated.avg = Math.round(100 * accumulated.sum / accumulated.count) / 100;
                accumulated.propertyName = properties.propertyName;
                accumulated.tooltip = JSON.stringify({
                    title: properties.propertyName,
                    content: {
                        Sum: accumulated.sum,
                        Count: accumulated.count,
                        Min: accumulated.min,
                        Max: accumulated.max,
                        Avg: accumulated.avg,
                    }
                })
            }
        });
    }
}

