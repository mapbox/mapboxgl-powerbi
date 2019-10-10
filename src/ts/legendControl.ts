module powerbi.extensibility.visual {
    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;

    export type ColorStops = {colorStop: number | string, color: string}[];

    export class LegendControl implements mapboxgl.IControl {
        private map: mapboxgl.Map;
        private legendContainer: HTMLElement;
        private legends: { [key: string] : HTMLElement } = {};

        public static readonly DEFAULT_NUMBER_FORMAT = "0.##"

        removeLegends() {
            if (this.legendContainer) {
                Object.keys(this.legends).forEach(key => {
                    if (this.legends[key]) {
                        this.legendContainer.removeChild(this.legends[key])
                    }
                })
            }
            this.legends = {}
        }

        addLegend(key: string, title: string, data: ColorStops, format: string) {
            if (this.legends[key]) {
                if (this.legendContainer) {
                    this.legendContainer.removeChild(this.legends[key])
                }
            }

            if (data) {
                this.legends[key] = this.createLegendElement(title, data, format)
                if (this.legendContainer) {
                    this.legendContainer.appendChild(this.legends[key])
                }
            }
        }

        onAdd(map: mapboxgl.Map): HTMLElement {
            this.map = map;
            if (!this.legendContainer) {
                this.legendContainer = document.createElement('div')
                this.legendContainer.className = 'mapboxgl-ctrl'
                this.legendContainer.id="mapbox-legend-container"
            }

            Object.keys(this.legends).forEach(key => {
                if (this.legends[key]) {
                    this.legendContainer.appendChild(this.legends[key])
                }
            })

            return this.legendContainer;
        }

        onRemove(map: mapboxgl.Map) {
            this.removeLegends()
            if (this.legendContainer) {
                this.legendContainer.parentNode.removeChild(this.legendContainer);
            }

            this.map = undefined;
            this.legendContainer = undefined;
        }

        getDefaultPosition(): string {
            return 'bottom-right';
        }

        createLegendElement(title: string, data: ColorStops, format: string): HTMLElement {
            const d = document;
            const legend = d.createElement('div');
            legend.setAttribute("class", "mapbox-legend mapboxgl-ctrl-group");

            const titleElement = d.createElement('div');
            const titleText = d.createTextNode(title);
            titleElement.className = 'mapbox-legend-title';
            titleElement.appendChild(titleText);
            legend.appendChild(titleElement)

            data.forEach(({colorStop, color}) => {
                const item = d.createElement('div');
                const colorElement = d.createElement('span');
                colorElement.setAttribute("class", "mapbox-legend-color middle");
                colorElement.setAttribute("style", "backgroundColor: color;");

                const valueElement = document.createElement('span');
                valueElement.setAttribute("class", "mapbox-legend-value middle");

                if (typeof colorStop === "number") {
                    const valueText = d.createTextNode(mapboxUtils.sanitizeHTML(valueFormatter.format(colorStop, format || LegendControl.DEFAULT_NUMBER_FORMAT)));
                    valueElement.appendChild(valueText);
                } else {
                    const valueText = d.createTextNode(mapboxUtils.sanitizeHTML(colorStop));
                    valueElement.appendChild(valueText);
                }

                item.appendChild(colorElement);
                item.appendChild(valueElement);
                legend.appendChild(item)
            })

            return legend
        }
    }
}
