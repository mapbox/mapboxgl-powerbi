module powerbi.extensibility.visual {
    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;

    export abstract class Layer {
        protected parent: MapboxMap;
        protected source: data.Datasource;
        protected id: string;
        protected prevLabelPositionSetting: string;

        protected colorStops: ColorStops;

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

        public getColorStops(): ColorStops {
            return this.colorStops;
        }

        static mapValuesToColorStops(colorInterval: string[], method: ClassificationMethod, classCount:number, values: number[]): ColorStops {
            if (!values || values.length == 0) {
                return []
            }

            if (values.length == 1) {
                const colorStop = values[0];
                const color = colorInterval[0];
                return [{colorStop, color}];
            }

            const domain: number[] = classCount ? mapboxUtils.getBreaks(values, method, classCount) : values;
            const colors = chroma.scale(colorInterval).colors(domain.length)
            return domain.map((colorStop, idx) => {
                const color = colors[idx].toString();
                return {colorStop, color};
            });
        }

        generateColorStops(settings: CircleSettings | ChoroplethSettings | ClusterSettings, isGradient: boolean, colorLimits: mapboxUtils.Limits, colorPalette: Palette): ColorStops {
            if (!isGradient) {
                return colorLimits.values.map(value => {
                    const colorStop = value.toString();
                    const color = colorPalette.getColor(colorStop);
                    return { colorStop, color };
                });
            }

            if ( settings instanceof ClusterSettings || !settings.diverging) {
                const classCount = mapboxUtils.getClassCount(colorLimits.values);
                return Layer.mapValuesToColorStops([settings.minColor, settings.maxColor], this.getClassificationMethod(), classCount, colorLimits.values)
            }

            const { minValue, midValue, maxValue, minColor, midColor, maxColor} = settings

            const filteredValues = mapboxUtils.filterValues(colorLimits.values, minValue, maxValue)
            // Split the interval into two halves when there is a middle value
            if (midValue != null) {
                const lowerHalf = []
                const upperHalf = []

                if (minValue != null) {
                    lowerHalf.push(minValue)
                }

                filteredValues.forEach(value => {
                    if (value < midValue) {
                        lowerHalf.push(value)
                    }
                    else {
                        upperHalf.push(value)
                    }
                })

                if (maxValue != null) {
                    upperHalf.push(maxValue)
                }

                // Add midValue to both interval
                lowerHalf.push(midValue)
                upperHalf.unshift(midValue)

                // Divide the colorstops between the two intervals (halve them)
                const lowerHalfClassCount = mapboxUtils.getClassCount(lowerHalf) >> 1;
                const upperHalfClassCount = mapboxUtils.getClassCount(upperHalf) >> 1;

                const lowerColorStops = Layer.mapValuesToColorStops([minColor, midColor], this.getClassificationMethod(), lowerHalfClassCount, lowerHalf)
                const upperColorStops = Layer.mapValuesToColorStops([midColor, maxColor], this.getClassificationMethod(), upperHalfClassCount, upperHalf)

                // Make sure the midValue included only once
                lowerColorStops.pop()
                return lowerColorStops.concat(upperColorStops)
            }

            if (minValue != null) {
                filteredValues.push(minValue)
            }

            if (maxValue != null) {
                filteredValues.push(maxValue)
            }

            const classCount = mapboxUtils.getClassCount(filteredValues);
            return Layer.mapValuesToColorStops([minColor, midColor, maxColor], this.getClassificationMethod(), classCount, filteredValues)
        }

        getClassificationMethod(): ClassificationMethod {
            return ClassificationMethod.Quantile
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
            let value = data.value
            if (tooltipData && tooltipData.format) {
                const { format, type } = tooltipData
                if (type.dateTime) {
                    value = new Date(data.value);
                    if (isNaN(value)) {
                        // Print original text if the date string is invalid.
                        value = data.value;
                    }
                } else if (type.numeric) {
                    value = Number(data.value);
                }
                value = valueFormatter.format(value, format);
            }
            return value;
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

        showLegend(settings: MapboxSettings, roleMap: RoleMap) {
            return this.layerExists()
        }

        addLegend(
            legend: LegendControl,
            roleMap: RoleMap,
            settings: MapboxSettings,
        ): void
        {
            const id = this.getId();
            const title = roleMap.color.displayName;
            const colorStops = this.getColorStops();
            const format = roleMap.color.format;
            legend.addLegend(id, title, colorStops, format);
        }
    }
}
