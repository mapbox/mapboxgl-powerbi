module powerbi.extensibility.visual {

    export class LegendControl implements mapboxgl.IControl {
        private map: mapboxgl.Map;
        private legendContainer: HTMLElement;
        private legends: { [key: string] : HTMLElement } = {};

        addLegend(key: string, title: string, data: [number, string][]) {
            if (this.legends[key]) {
                if (this.legendContainer) {
                    this.legendContainer.removeChild(this.legends[key])
                }
            }

            this.legends[key] = this.createLegendElement(title, data)
            if (this.legendContainer) {
                this.legendContainer.appendChild(this.legends[key])
            }
        }

        onAdd(map: mapboxgl.Map): HTMLElement {
            this.map = map;
            this.legendContainer = document.createElement('div')
            this.legendContainer.className = 'mapboxgl-ctrl'
            this.legendContainer.id="mapbox-legend-container"

            Object.keys(this.legends).forEach(key => {
                if (this.legends[key]) {
                    this.legendContainer.appendChild(this.legends[key])
                }
            })

            return this.legendContainer;
        }

        onRemove(map: mapboxgl.Map) {
            Object.keys(this.legends).forEach(key => {
                if (this.legends[key]) {
                    this.legendContainer.removeChild(this.legends[key])
                }
            })
            this.legends = {}

            this.legendContainer.parentNode.removeChild(this.legendContainer);
            this.map = undefined;
        }

        getDefaultPosition(): string {
            return 'bottom-right';
        }

        createLegendElement(title: string, data: [number, string][]): HTMLElement {
            const legend = document.createElement('div')
            legend.className = "mapbox-legend mapboxgl-ctrl-group"

            const titleElement = document.createElement('div');
            titleElement.innerHTML = title
            legend.appendChild(titleElement)

            data.forEach(([value, color]) => {
                const item = document.createElement('div');
                const colorElement = document.createElement('span');
                colorElement.className = 'mapbox-legend-color';
                colorElement.style.backgroundColor = color;

                const valueElement = document.createElement('span');
                valueElement.innerHTML = value.toString()

                item.appendChild(colorElement);
                item.appendChild(valueElement);
                legend.appendChild(item)
            })

            return legend
        }
    }
}
