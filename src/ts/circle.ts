module powerbi.extensibility.visual {
    declare var turf : any;
    const NUMBER_OF_COLORVALUES = 12;

    export class Circle {
        private parent: MapboxMap;
        private palette: IColorPalette;
        private static ID = 'circle';
        private category: any;

        constructor(map: MapboxMap, palette: IColorPalette) {
            this.parent = map
            this.palette = palette
        }

        static getColorFromIndex(index: number) {
            return index % NUMBER_OF_COLORVALUES
        }

        updateCategory(columns) {
            this.category = columns.find( column => {
                return column.roles.color;
            });
        }

        addLayer(beforeLayerId) {
            const map = this.parent.getMap();
            const circleLayer = mapboxUtils.decorateLayer({
                id: 'circle',
                source: 'data',
                type: 'circle'
            });
            map.addLayer(circleLayer, beforeLayerId);
        }

        applySettings(features, settings) {
            const map = this.parent.getMap();
            map.setLayoutProperty(Circle.ID, 'visibility', settings.circle.show ? 'visible' : 'none');
            if (settings.circle.show) {
                const colorLimits = mapboxUtils.getLimits(features.rawData, 'colorValue');
                const sizeLimits = mapboxUtils.getLimits(features.rawData, 'sizeValue');

                const sizes = Circle.getSizes(sizeLimits, map, settings);

                let isGradient = this.shouldUseGradient(colorLimits);
                let colors = Circle.getColors(colorLimits, isGradient, settings, this.palette);

                map.setPaintProperty(Circle.ID, 'circle-radius', sizes);
                map.setPaintProperty(Circle.ID, 'circle-color', colors);
                map.setLayerZoomRange(Circle.ID, settings.circle.minZoom, settings.circle.maxZoom);
                map.setPaintProperty(Circle.ID, 'circle-blur', settings.circle.blur / 100);
                map.setPaintProperty(Circle.ID, 'circle-opacity', settings.circle.opacity / 100);
                map.setPaintProperty(Circle.ID, 'circle-stroke-width', settings.circle.strokeWidth);
                map.setPaintProperty(Circle.ID, 'circle-stroke-opacity', settings.circle.strokeOpacity / 100);
                map.setPaintProperty(Circle.ID, 'circle-stroke-color', settings.circle.strokeColor);
            }
        }

        private shouldUseGradient(colorLimits: { min: any; max: any; values: any; }) {
            if (this.category != null && this.category.isMeasure) {
                return true
            }

            if (colorLimits == null || colorLimits.values == null || colorLimits.values.length == null) {
                return false
            }

            if (colorLimits.values.length >= NUMBER_OF_COLORVALUES) {
                return true
            }

            return false
        }

        private static getColors(colorLimits: { min: number; max: number; values: number[] }, isGradient: boolean, settings: any, colorPalette: IColorPalette) {
            if (colorLimits.min == null || colorLimits.max == null || colorLimits.values.length <= 0) {
                return settings.circle.minColor;
            }

            if (isGradient) {
                // Set colors for continuous value
                const classCount = getClassCount(colorLimits);

                const domain: any[] = getNaturalBreaks(colorLimits, classCount);
                const colors = chroma.scale([settings.circle.minColor,settings.circle.medColor, settings.circle.maxColor]).colors(domain.length)

                const style = ["interpolate", ["linear"], ["to-number", ['get', 'colorValue']]]
                domain.map((colorStop, idx) => {
                    const color = colors[idx].toString();
                    style.push(colorStop);
                    style.push(color);
                });

                return style;
            }

            // Set colors for categorical value
            let colors = ['match', ['to-string', ['get', 'colorValue']]];
                for (let index = colorLimits.min; index < colorLimits.max; index++) {
                    const idx = "" + (index-colorLimits.min);
                    const color = colorPalette.getColor(idx).value;
                    colors.push(idx);
                    colors.push(color);
                }
                // Add transparent as default so that we only see regions
                // for which we have data values
                colors.push('rgba(255,0,0,255)');

            return colors;
        }

        private static getSizes(sizeLimits: { min: any; max: any; values: any[]; }, map: any, settings: any) {
            if (sizeLimits.min != null && sizeLimits.max != null && sizeLimits.min != sizeLimits.max) {
                const style: any[] = [
                    "interpolate", ["linear"],
                    ["to-number", ['get', 'sizeValue']]
                ]

                const classCount = getClassCount(sizeLimits);
                const sizeStops: any[] = getNaturalBreaks(sizeLimits, classCount);
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

    function getClassCount(limits: { min: number; max: number; values: number[]; }) {
        const MAX_BOUND_COUNT = 6;
        // For example if you want 5 classes, you have to enter 6 bounds
        // (1 bound is the minimum value, 1 bound is the maximum value,
        // the rest are class separators)
        const classCount = Math.min(limits.values.length, MAX_BOUND_COUNT) - 1;
        return classCount;
    }

    function getNaturalBreaks(limits: { min: any; max: any; values: any[]; }, classCount: number) {
        const stops: any[] = chroma.limits(limits.values, 'q', classCount);
        return stops;
    }
}

