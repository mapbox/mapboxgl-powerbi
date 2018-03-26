module powerbi.extensibility.visual {
    export class Heatmap {
        private parent: MapboxMap;
        private static ID = 'heatmap'

        constructor(map: MapboxMap) {
            this.parent = map
        }

        addLayer(beforeLayerId) {
            const map = this.parent.getMap();
            const heatmapLayer = mapboxUtils.decorateLayer({
                id: Heatmap.ID,
                source: 'data',
                type: 'heatmap'
            });
            map.addLayer(heatmapLayer, beforeLayerId);
        }

        applySettings(features, settings) {
            const map = this.parent.getMap();
            map.setLayoutProperty(Heatmap.ID, 'visibility', settings.heatmap.show ? 'visible' : 'none');
            if (settings.heatmap.show) {
                map.setLayerZoomRange(Heatmap.ID, settings.heatmap.minZoom, settings.heatmap.maxZoom);
                map.setPaintProperty(Heatmap.ID, 'heatmap-radius', [ "interpolate", ["exponential", 1.2], ["zoom"],
                    0, settings.heatmap.radius, 14, settings.heatmap.radius*25
                    ]);
                map.setPaintProperty(Heatmap.ID, 'heatmap-intensity', settings.heatmap.intensity);
                map.setPaintProperty(Heatmap.ID, 'heatmap-opacity', settings.heatmap.opacity / 100);
                map.setPaintProperty(Heatmap.ID, 'heatmap-color', [ "interpolate", ["linear"], ["heatmap-density"],
                    0, "rgba(0, 0, 255, 0)",
                    0.1, settings.heatmap.minColor,
                    0.5, settings.heatmap.medColor,
                    1, settings.heatmap.maxColor]);
            }
        }
    }
}

