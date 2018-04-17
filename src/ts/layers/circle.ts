module powerbi.extensibility.visual {
    declare var turf : any;
    const NUMBER_OF_COLORVALUES = 12;

    export class Circle extends Point {
        private palette: IColorPalette;
        private static ID = 'circle';

        constructor(map: MapboxMap, palette: IColorPalette) {
            super(map)
            this.id = Circle.ID
            this.palette = palette
        }

        addLayer(settings, beforeLayerId) {
            const map = this.parent.getMap();
            const circleLayer = mapboxUtils.decorateLayer({
                id: 'circle',
                source: 'data',
                type: 'circle'
            });
            map.addLayer(circleLayer, beforeLayerId);
        }

        removeLayer() {
            const map = this.parent.getMap();
            map.removeLayer(Circle.ID);
            this.source.removeFromMap(map, Circle.ID);
        }

        applySettings(settings, roleMap) {
            super.applySettings(settings, roleMap);
            const map = this.parent.getMap();
            if (settings.circle.show) {
                const sizes = Circle.getSizes(this.sizeLimits, map, settings, roleMap.size);

                let isGradient = mapboxUtils.shouldUseGradient(roleMap.color, this.colorLimits);
                let colors = Circle.getColors(this.colorLimits, isGradient, settings, this.palette, roleMap.color);

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

        private static getColors(colorLimits: mapboxUtils.Limits, isGradient: boolean, settings: any, colorPalette: IColorPalette, colorField: any) {
            if (!colorField || colorLimits == null || colorLimits.min == null || colorLimits.max == null || colorLimits.values.length <= 0) {
                return settings.circle.minColor;
            }

            if (isGradient) {
                // Set colors for continuous value
                const classCount = mapboxUtils.getClassCount(colorLimits);

                const domain: any[] = mapboxUtils.getNaturalBreaks(colorLimits, classCount);
                const colors = chroma.scale([settings.circle.minColor,settings.circle.medColor, settings.circle.maxColor]).colors(domain.length)

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
                const color = colorPalette.getColor(idx.toString()).value;
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
                    ["to-number", ['get',sizeField.displayName]]
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

