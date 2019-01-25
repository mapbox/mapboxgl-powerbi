module powerbi.extensibility.visual {

    export class Circle extends Layer {
        private filter: Filter;
        private palette: Palette;
        private settings: CircleSettings;

        public static readonly ID = 'circle';
        private static readonly HighlightID = 'circle-highlight';

        private static readonly LayerOrder = [Circle.ID, Circle.HighlightID];

        constructor(map: MapboxMap, filter: Filter, palette: Palette) {
            super(map)
            this.id = Circle.ID
            this.filter = filter
            this.palette = palette
            this.source = data.Sources.Point
        }

        getLayerIDs() {
            return [ Circle.ID ];
        }

        getSource(settings) {
            this.settings = settings.circle;
            return super.getSource(settings);
        }

        addLayer(settings, beforeLayerId, roleMap) {
            const map = this.parent.getMap();
            const latitude = roleMap.latitude.displayName;
            const layers = {};

            layers[Circle.ID] = mapboxUtils.decorateLayer({
                id: Circle.ID,
                source: 'data',
                type: 'circle'
            });

            const zeroFilter = ["==", latitude, ""]
            layers[Circle.HighlightID] = mapboxUtils.decorateLayer({
                id: Circle.HighlightID,
                type: 'circle',
                source: 'data',
                filter: zeroFilter
            });

            Circle.LayerOrder.forEach((layerId) => map.addLayer(layers[layerId], beforeLayerId));

            map.setPaintProperty(Circle.HighlightID, 'circle-color', settings.circle.highlightColor);
            map.setPaintProperty(Circle.HighlightID, 'circle-opacity', 1);
            map.setPaintProperty(Circle.HighlightID, 'circle-stroke-width', 1);
            map.setPaintProperty(Circle.HighlightID, 'circle-stroke-color', 'black');
        }

        moveLayer(beforeLayerId: string) {
            const map = this.parent.getMap();
            Circle.LayerOrder.forEach((layerId) => map.moveLayer(layerId, beforeLayerId));
        }

        hoverHighLight(e) {
            if (!this.layerExists()) {
                return;
            }

            const roleMap = this.parent.getRoleMap();
            const latitude = roleMap.latitude.displayName;
            const longitude = roleMap.longitude.displayName;
            const eventProps = e.features[0].properties;
            const lngLatFilter = ["all",
                ["==", latitude, eventProps[latitude]],
                ["==", longitude, eventProps[longitude]],
            ]
            this.parent.getMap().setFilter(Circle.HighlightID, lngLatFilter);
        }

        removeHighlight(roleMap) {
            if (!this.layerExists()) {
                return;
            }
            const latitude = roleMap.latitude.displayName;
            const map = this.parent.getMap();
            const zeroFilter = ["==", latitude, ""];
            map.setFilter(Circle.HighlightID, zeroFilter);
            if (this.settings.opacity) {
                map.setPaintProperty(Circle.ID, 'circle-opacity', this.settings.opacity / 100);
            }
        }

        updateSelection(features, roleMap) {
            const map = this.parent.getMap();
            const latitude = roleMap.latitude.displayName;
            const longitude = roleMap.longitude.displayName;

            let lngLatFilter = [];
            lngLatFilter.push("any");
            let selectionIds = features
                .slice(0, constants.MAX_SELECTION_COUNT)
                .map( (feature, index) => {
                    lngLatFilter.push(["all",
                        ["==", latitude, feature.properties[latitude]],
                        ["==", longitude, feature.properties[longitude]]]);
                    return feature.id;
            });
            this.filter.addSelection(selectionIds)

            map.setFilter(Circle.HighlightID, lngLatFilter);

            const opacity = this.filter.getSelectionOpacity(this.settings.opacity)
            map.setPaintProperty(Circle.ID, 'circle-opacity', opacity);
            return selectionIds
        }

        removeLayer() {
            const map = this.parent.getMap();
            Circle.LayerOrder.forEach(layerId => map.removeLayer(layerId));
            this.source.removeFromMap(map, Circle.ID);
        }

        applySettings(settings, roleMap) {
            super.applySettings(settings, roleMap);
            const map = this.parent.getMap();
            const limits = this.source.getLimits();
            if (settings.circle.show) {
                const sizes = Circle.getSizes(limits.size, map, settings, roleMap.size);

                let isGradient = mapboxUtils.shouldUseGradient(roleMap.color);
                let colors = Circle.getColors(limits.color, isGradient, settings, this.palette, roleMap.color);

                map.setPaintProperty(Circle.ID, 'circle-radius', sizes);
                map.setPaintProperty(Circle.HighlightID, 'circle-radius', sizes);
                map.setPaintProperty(Circle.HighlightID, 'circle-color', settings.circle.highlightColor);
                map.setPaintProperty(Circle.ID, 'circle-color', colors);
                map.setLayerZoomRange(Circle.ID, settings.circle.minZoom, settings.circle.maxZoom);
                map.setPaintProperty(Circle.ID, 'circle-blur', settings.circle.blur / 100);
                map.setPaintProperty(Circle.ID, 'circle-opacity', settings.circle.opacity / 100);
                map.setPaintProperty(Circle.ID, 'circle-stroke-width', settings.circle.strokeWidth);
                map.setPaintProperty(Circle.ID, 'circle-stroke-opacity', settings.circle.strokeOpacity / 100);
                map.setPaintProperty(Circle.ID, 'circle-stroke-color', settings.circle.strokeColor);
            }
        }

        private static getColors(colorLimits: mapboxUtils.Limits, isGradient: boolean, settings: any, colorPalette: Palette, colorField: any) {
            if (!colorField || colorLimits == null || colorLimits.min == null || colorLimits.max == null || colorLimits.values.length <= 0) {
                return settings.circle.minColor;
            }

            if (isGradient) {
                // Set colors for continuous value
                const classCount = mapboxUtils.getClassCount(colorLimits);

                const domain: any[] = mapboxUtils.getNaturalBreaks(colorLimits, classCount);
                const colors = chroma.scale([settings.circle.minColor, settings.circle.medColor, settings.circle.maxColor]).colors(domain.length)
                const style = ["interpolate", ["linear"], ["to-number", ['get', colorField.displayName]]]
                domain.map((colorStop, idx) => {
                    const color = colors[idx].toString();
                    style.push(colorStop);
                    style.push(color);
                });

                return style;
            }

            // Set colors for categorical value
            let colors = ['match', ['to-string', ['get', colorField.displayName]]];
            colorLimits.values.map( (value, idx) => {
                colors.push(value.toString());
                const color = colorPalette.getColor(value.toString(), idx);
                colors.push(color);
            });

            // Add transparent as default so that we only see regions
            // for which we have data values
            colors.push('rgba(255,0,0,255)');

            return colors;
        }

        private static getSizes(sizeLimits: mapboxUtils.Limits, map: any, settings: any, sizeField: any) {
            if (sizeField && sizeLimits && sizeLimits.min != null && sizeLimits.max != null && sizeLimits.min != sizeLimits.max) {
                const style: any[] = [
                    "interpolate", ["linear"],
                    ["to-number", ['get', sizeField.displayName]]
                ]

                const classCount = mapboxUtils.getClassCount(sizeLimits);
                const sizeStops: any[] = mapboxUtils.getNaturalBreaks(sizeLimits, classCount);
                const sizeDelta = (settings.circle.radius * settings.circle.scaleFactor - settings.circle.radius) / classCount

                sizeStops.map((sizeStop, index) => {
                    const size = settings.circle.radius + index * sizeDelta
                    style.push(sizeStop);
                    style.push(size);
                });
                return style;
            }
            else {
                return [
                    'interpolate', ['linear'], ['zoom'],
                    0, settings.circle.radius,
                    18, settings.circle.radius * settings.circle.scaleFactor
                ];
            }
        }
    }
}

