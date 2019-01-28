module powerbi.extensibility.visual {
    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;

    export abstract class Layer {
        protected parent: MapboxMap;
        protected source: data.Datasource;
        protected id: string;
        protected prevLabelPositionSetting: string;

        constructor(map: MapboxMap) {
            this.parent = map;
            this.prevLabelPositionSetting = map.getSettings().api.labelPosition;
        }

        updateSource(features, roleMap, settings) {
            if (settings[this.id].show) {
                this.source.update(this.parent.getMap(), features, roleMap, settings);
            }
        }

        getBounds(settings) : any[] {
            if (settings[this.id].show) {
                return this.source.getBounds();
            }
            return null;
        }

        getId() {
            return this.id
        }

        abstract getLayerIDs()

        updateSelection(features, roleMap) {
        }

        hoverHighLight(e) {
        }

        removeHighlight(roleMap) {
        }

        applySettings(settings: MapboxSettings, roleMap) {
            const map = this.parent.getMap();
            if (settings[this.id].show) {
                if (this.prevLabelPositionSetting === settings.api.labelPosition) {
                    if (!this.layerExists()) {
                        let firstSymbolId = this.calculateLabelPosition(settings, map)
                        this.addLayer(settings, firstSymbolId, roleMap);
                    }
                } else {
                    const firstSymbolId = this.calculateLabelPosition(settings, map)
                    this.moveLayer(firstSymbolId)
                }
            } else {
                if (this.layerExists()) {
                    this.removeLayer();
                }
            }
            if (this.prevLabelPositionSetting !== settings.api.labelPosition) { 
                this.prevLabelPositionSetting = settings.api.labelPosition;
            }
        }

        addLayer(settings, beforeLayerId: string, roleMap) {}
        moveLayer(beforeLayerId: string) {}
        abstract removeLayer()

        layerExists() {
            const map = this.parent.getMap();
            const layer = map.getLayer(this.id);
            return layer != null;
        }

        getSource(settings) {
            if (settings[this.id].show) {
                this.source.ensure(this.parent.getMap(), this.id, settings);
                return this.source;
            }
            return null;
        }

        handleZoom(settings) : boolean {
            if (settings[this.id].show) {
                return this.source.handleZoom(this.parent.getMap(), settings);
            }
            return false;
        }

        hasTooltip(tooltips) {
            if (!tooltips) {
                // Do not show tooltip if no property is pulled into 'tooltips' data role
                return false;
            }
            return true;
        }

        getFormattedTooltipValue(roleMap, data): string {
            const displayName = data.displayName
            const tooltipData = roleMap.tooltips[displayName];
            let val = data.value
            if (tooltipData && tooltipData.format) {
                const formatter = valueFormatter.create({format: tooltipData.format});
                const type = tooltipData.type
                if (type.dateTime) {
                    val = new Date(data.value);
                    if (isNaN(val)) {
                        // Print original text if the date string is invalid.
                        val = data.value;
                    }
                } else if (type.numeric) {
                    val = new Number(data.value);
                }
                val = formatter.format(val);
            }
            return val;
        }

        /*
        Override this method and implement the custom logic to show tooltips for a custom layer
        */
        handleTooltip(tooltipEvent: TooltipEventArgs<number>, roleMap, settings): VisualTooltipDataItem[] {
            return [];
        }

        calculateLabelPosition(settings: MapboxSettings, map: mapboxgl.Map) {
            // If there is no firstSymbolId specified, it adds the data as the last element.
            let firstSymbolId = null;
            if (settings.api.labelPosition === 'above') {
                // For default styles place data under waterway-label layer
                firstSymbolId = 'waterway-label';
                if (settings.api.style == 'mapbox://styles/mapbox/satellite-v9?optimize=true' ||
                    settings.api.style == 'custom') {
                    // For custom style find the lowest symbol layer to place data underneath
                    firstSymbolId = '';
                    let layers = map.getStyle().layers;
                    for (let i = 0; i < layers.length; i++) {
                        if (layers[i].type === 'symbol') {
                            firstSymbolId = layers[i].id;
                            break;
                        }
                    }
                }
            }
            return firstSymbolId;
        }

        static getTooltipData(value: any): VisualTooltipDataItem[] {
            if (!value) {
                return [];
            }
            // Flatten the multiple properties or multiple datapoints
            return [].concat.apply([], value.map(properties => {
                // This mapping is needed to copy the value with the toString
                // call as otherwise some caching logic causes to be the same
                // tooltip displayed for all datapoints.
                return properties.map(prop => {
                    return {
                        displayName: prop.key,
                        value: prop.value.toString(),
                    };
                });
            }));
        }
    }
}
