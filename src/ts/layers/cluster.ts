module powerbi.extensibility.visual {
    declare var turf : any;
    declare var supercluster : any;

    export class Cluster extends Layer {
        private cluster: any;
        private static ID = 'cluster'
        private static LabelID = 'cluster-label'
        private static UnclusterID = 'uncluster'
        private limits: mapboxUtils.Limits;
        protected bounds: any[];
        
        constructor(map: MapboxMap, getClusterField) {
            super(map)
            this.cluster = createCluster(getClusterField);
        }

        show(settings) {
            return settings.cluster.show;
        }

        update(features) {
            this.cluster.load(features);
        }

        getData(settings) {
            const worldBounds = [-180.0000, -90.0000, 180.0000, 90.0000];
            const map = this.parent.getMap();
            this.cluster.options.radius = settings.cluster.clusterRadius;
            this.cluster.options.maxZoom = settings.cluster.clusterMaxZoom;
            return this.cluster.getClusters(worldBounds, Math.floor(map.getZoom()) ).
                map( feature => {
                    // Remove built-in supercluster properties
                    // as they are not needed and are ruining our tooltips
                    delete feature.properties.cluster;
                    delete feature.properties.cluster_id;
                    delete feature.properties.point_count;
                    delete feature.properties.point_count_abbreviated;
                    return feature;
                });
        }

        layerExists() {
            const map = this.parent.getMap();
            const layer = map.getLayer(Cluster.ID);
            return layer != null;
        }
 
        removeLayer() {
            const map = this.parent.getMap();
            map.removeLayer(Cluster.ID);
            map.removeLayer(Cluster.UnclusterID);
            map.removeLayer(Cluster.LabelID);
            map.removeSource('clusterData');
        }

        addLayer(settings, beforeLayerId) {
            const map = this.parent.getMap();
            const clusterLayer = mapboxUtils.decorateLayer({
                id: Cluster.ID,
                source: 'clusterData',
                type: 'cluster',
                filter: ['has', 'Count']
            });
            const unclusterLayer = mapboxUtils.decorateLayer({
                id: Cluster.UnclusterID,
                source: 'clusterData',
                type: 'cluster',
                filter: ['!has', 'Count']
            });

            map.addLayer(clusterLayer, beforeLayerId);
            map.addLayer(unclusterLayer, beforeLayerId);

            const clusterLabelLayer = mapboxUtils.decorateLayer({
                id: Cluster.LabelID,
                type: 'symbol',
                source: 'clusterData',
                filter: ["has", "Count"],
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

        updateSource(features, roleMap, settings) {
            const map = this.parent.getMap();
            let source: any = map.getSource('clusterData');
            if (settings.cluster.show) {
                console.log("Cluster.updateSource");
                if (!source) {
                    console.log("Adding source clusterData");
                    map.addSource('clusterData', {
                        type: 'geojson',
                        data: turf.helpers.featureCollection([]),
                        buffer: 0
                    });
                    source = map.getSource('clusterData');
                }

                this.update(features);
                this.handleZoom(settings)
                const featureCollection = turf.helpers.featureCollection(features);
                this.bounds = turf.bbox(featureCollection);
            } else {
                this.update([])
                this.bounds = null;
            }
        }

        getBounds() : any[] {
            return this.bounds;
        }

        handleZoom(settings) {
            if (settings.cluster.show) {
                const map = this.parent.getMap();
                let source: any = map.getSource('clusterData');
                const clusterData = this.getData(settings);
                source.setData(turf.helpers.featureCollection(clusterData));
                this.limits = mapboxUtils.getLimits(clusterData, settings.cluster.aggregation);
            }
        }

        applySettings(settings, roleMap) {
            super.applySettings(settings, roleMap);
            const map = this.parent.getMap();
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
                if (this.limits.min && this.limits.max) {
                    map.setPaintProperty(Cluster.ID, 'circle-color', [
                        'interpolate', ['linear'], ['get', settings.cluster.aggregation],
                        this.limits.min, settings.cluster.minColor,
                        this.limits.max, settings.cluster.maxColor
                    ]);

                    map.setPaintProperty(Cluster.ID, 'circle-radius', [
                        'interpolate', ['linear'], ['get', settings.cluster.aggregation],
                        this.limits.min, settings.cluster.radius,
                        this.limits.max, 3 * settings.cluster.radius,
                    ]);

                    map.setLayoutProperty(Cluster.LabelID, 'text-field', `{${settings.cluster.aggregation}}`);
                }
            }
        }
    }

    function createCluster(getClusterField) {
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
                const Count = 1;
                const Sum = Number(properties[getClusterField()]);
                const Minimum = Number(properties[getClusterField()]);
                const Maximum = Number(properties[getClusterField()]);
                const Average = Number(properties[getClusterField()]);
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

    function roundToDecimals(value, decimals) {
        const tenPow = Math.pow(10, decimals)
        return Math.round(value * tenPow) / tenPow
    }

}

