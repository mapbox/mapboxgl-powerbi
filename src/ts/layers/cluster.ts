module powerbi.extensibility.visual {
    declare var turf : any;

    export class Cluster extends Layer {
        private static ID = 'cluster'
        private static LabelID = 'cluster-label'
        private static UnclusterID = 'uncluster'
        
        constructor(map: MapboxMap, getClusterField) {
            super(map)
            this.id = Cluster.ID
            this.source = data.Sources.Cluster.withGetter(getClusterField)
        }

        show(settings) {
            return settings.cluster.show;
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
                const limits = this.source.getLimits()
                if (limits && limits.min && limits.max) {
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
}

