export class LegendContainer implements mapboxgl.IControl {
    private legendContainer: HTMLElement;
    private legends: { [key: string]: HTMLElement } = {};
    private position: string;

    constructor(position: string) {
        this.position = position
    }

    setLegends(legends, isNewLegendCreated) {
        if (legends) {
            this.legends = legends
            Object.keys(this.legends).forEach(key => {
                this.legendContainer.prepend(this.legends[key])
                if (isNewLegendCreated) {
                    this.calculateHorizontalPosition(key)
                }
            })

            if (isNewLegendCreated) {
                this.calculateVerticalPosition()
            }
        }
    }

    calculateHorizontalPosition(key) {
        const containerWidth = this.legendContainer.offsetWidth
        this.legends[key].style.setProperty("--left", containerWidth + "px");
    }

    calculateVerticalPosition() {
        // After everything is on its place horizontally, we can set the same height for every element and change the position to absolute
        const containerHeight = this.legendContainer.offsetHeight;
        const layerControl = document.getElementById("mapbox-layer-control-container")
        const layerControlHeight = layerControl ? 50 : 0

        Object.keys(this.legends).forEach(key => {
            this.legends[key].style.height = `${containerHeight - 18}px`; // height minus padding
            this.legends[key].style.setProperty("--top", -containerHeight + "px");
            this.legends[key].style.setProperty("--layerControlHeight", layerControlHeight + "px");
            this.legends[key].style.position = "absolute";
        })
    }

    onAdd(map: mapboxgl.Map): HTMLElement {
        this.legendContainer = document.createElement('div')
        this.legendContainer.className = 'mapboxgl-ctrl mapbox-legend-container'
        this.legendContainer.id = `legend-container-${this.position}`

        return this.legendContainer;
    }

    removeChild(legend) {
        this.legendContainer.removeChild(legend);
    }

    onRemove(map: mapboxgl.Map) {
        this.legendContainer?.parentNode?.removeChild(this.legendContainer);
    }

    getDefaultPosition(): string {
        return this.position
    }

    setPosition(position: string) {
        this.position = position
    }
}
