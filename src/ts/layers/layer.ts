module powerbi.extensibility.visual {
    export abstract class Layer {
        protected parent: MapboxMap;
        protected source: data.Datasource;
        protected id: string;

        constructor(map: MapboxMap) {
            this.parent = map;
        }

        updateSource(features, roleMap, settings) {
            if (settings[this.id].show) {
                this.source.update(this.parent.getMap(), features, roleMap);
            }
        }

        abstract getBounds() : any[];

        applySettings(settings, roleMap) {
            const map = this.parent.getMap();
            if (settings[this.id].show) {
                if (!this.layerExists()) {
                    // For default styles place data under waterway-label layer
                    let firstSymbolId = 'waterway-label';

                    if (settings.api.style == 'mapbox://styles/mapbox/satellite-v9?optimize=true' ||
                        settings.api.style == 'custom') {
                        //For custom style find the lowest symbol layer to place data underneath
                        firstSymbolId = ''
                        let layers = map.getStyle().layers;
                        for (var i = 0; i < layers.length; i++) {
                            if (layers[i].type === 'symbol') {
                                firstSymbolId = layers[i].id;
                                break;
                            }
                        }
                    }
                    this.addLayer(settings, firstSymbolId);
                }
            } else {
                if (this.layerExists()) {
                    this.removeLayer();
                }
            }
        }

        addLayer(settings, beforeLayerId : string) {
        }

        layerExists() {
            const map = this.parent.getMap();
            const layer = map.getLayer(this.id);
            return layer != null;
        }

        getSource(settings, map) {
            if (settings[this.id].show) {
                return this.source.ensure(map, this.id)
            }
            return null;
        }

        abstract removeLayer()

        handleZoom(settings) {
        }

    }
}


