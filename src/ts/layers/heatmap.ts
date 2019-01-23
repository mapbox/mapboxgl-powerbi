module powerbi.extensibility.visual {
    export class Heatmap extends Layer {
        private static ID = 'heatmap'

        constructor(map: MapboxMap) {
            super(map)
            this.id = Heatmap.ID
            this.source = data.Sources.Point
        }

        getLayerIDs() {
            return [ Heatmap.ID ];
        }

        addLayer(settings, beforeLayerId, roleMap) {
            const map = this.parent.getMap();
            const heatmapLayer = mapboxUtils.decorateLayer({
                id: Heatmap.ID,
                source: 'data',
                type: 'heatmap',
            });
            map.addLayer(heatmapLayer, beforeLayerId);
        }

        removeLayer() {
            const map = this.parent.getMap();
            map.removeLayer(Heatmap.ID);
            this.source.removeFromMap(map, Heatmap.ID);
        }

        moveLayer(settings, beforeLayerId: string, roleMap) {
            const map = this.parent.getMap();
            map.moveLayer(Heatmap.ID, beforeLayerId)
        }

        applySettings(settings, roleMap) {
            super.applySettings(settings, roleMap);
            const map = this.parent.getMap();
            if (settings.heatmap.show) {
                map.setLayerZoomRange(Heatmap.ID, settings.heatmap.minZoom, settings.heatmap.maxZoom);
                map.setPaintProperty(Heatmap.ID, 'heatmap-radius', [ "interpolate", ["exponential", 1.2], ["zoom"],
                    0, settings.heatmap.radius, 14, settings.heatmap.radius * 25
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

