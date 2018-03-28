module powerbi.extensibility.visual {
    declare var turf : any;
    const NUMBER_OF_COLORVALUES = 12;

    export class Circle {
        private parent: MapboxMap;
        private palette: IColorPalette;
        private static ID = 'circle';
        private colorColumn: any;

        constructor(map: MapboxMap, palette: IColorPalette) {
            this.parent = map
            this.palette = palette
        }

        updateColorColumn(columns) {
            this.colorColumn = columns.find( column => {
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

        applySettings(features, settings, roleMap) {
            const map = this.parent.getMap();
            map.setLayoutProperty(Circle.ID, 'visibility', settings.circle.show ? 'visible' : 'none');
            if (settings.circle.show) {
                const colorLimits = mapboxUtils.getLimits(features.rawData, roleMap.color);
                const sizeLimits = mapboxUtils.getLimits(features.rawData, roleMap.size);

                const sizes = Circle.getSizes(sizeLimits, map, settings, roleMap.size);

                let isGradient = mapboxUtils.shouldUseGradient(this.colorColumn, colorLimits);
                let colors = Circle.getColors(colorLimits, isGradient, settings, this.palette, roleMap.color);

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

        private static getColors(colorLimits: { min: number; max: number; values: number[] }, isGradient: boolean, settings: any, colorPalette: IColorPalette, colorField: string) {
            if (colorLimits.min == null || colorLimits.max == null || colorLimits.values.length <= 0) {
                return settings.circle.minColor;
            }

            if (isGradient) {
                // Set colors for continuous value
                const classCount = mapboxUtils.getClassCount(colorLimits);

                const domain: any[] = mapboxUtils.getNaturalBreaks(colorLimits, classCount);
                const colors = chroma.scale([settings.circle.minColor,settings.circle.medColor, settings.circle.maxColor]).colors(domain.length)

                const style = ["interpolate", ["linear"], ["to-number", ['get', colorField]]]
                domain.map((colorStop, idx) => {
                    const color = colors[idx].toString();
                    style.push(colorStop);
                    style.push(color);
                });

                return style;
            }

            // Set colors for categorical value
            let colors = ['match', ['to-string', ['get', colorField]]];
            colorLimits.values.map( (value, idx) => {
                colors.push(value.toString());
                const color = colorPalette.getColor(idx.toString()).value;
                colors.push(color);
            });
            
            // Add transparent as default so that we only see regions
            // for which we have data values
            colors.push('rgba(255,0,0,255)');

            return colors;
        }

        private static getSizes(sizeLimits: { min: any; max: any; values: any[]; }, map: any, settings: any, sizeField: string) {
            if (sizeLimits.min != null && sizeLimits.max != null && sizeLimits.min != sizeLimits.max) {
                const style: any[] = [
                    "interpolate", ["linear"],
                    ["to-number", ['get',sizeField]]
                ]

                const classCount = mapboxUtils.getClassCount(sizeLimits);
                const sizeStops: any[] = mapboxUtils.getNaturalBreaks(sizeLimits, classCount);
                const sizeDelta = (settings.circle.radius * settings.circle.scaleFactor - settings.circle.radius) / classCount

                sizeStops.map((sizeStop, index) => {
                    const size = settings.circle.radius + index * sizeDelta
                    style.push(sizeStop);
                    style.push(size);
                });
                console.log("Style: ", style);
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

