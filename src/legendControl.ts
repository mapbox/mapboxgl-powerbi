import * as formatting from "powerbi-visuals-utils-formattingutils"
import { dragElement } from "./mapboxUtils"
import { LegendContainer } from "./legendContainer"
const valueFormatter = formatting.valueFormatter;

export type ColorStops = { colorStop: number | string, color: string }[];

export class LegendControl {
    private map: mapboxgl.Map;
    private legendContainer: { [legendPosition: string]: LegendContainer } = {};
    private legends: { [legendPosition: string]: { [key: string]: HTMLElement } } = {};
    private opacity: number;
    private isNewLegendCreated: boolean;
    private positions: any[] = ["bottom-right", "bottom-left", "top-right", "top-left"];

    public static readonly DEFAULT_NUMBER_FORMAT = "0.##"

    constructor(map) {
        this.map = map;
    }

    addControl() {
        this.positions.forEach(legendPosition => {
            this.legendContainer[legendPosition] = new LegendContainer(legendPosition)
            this.map.addControl(this.legendContainer[legendPosition], legendPosition)
        })
    }

    removeControl() {
        this.positions.forEach(legendPosition => {
            if (this.legendContainer[legendPosition]) {
                this.map.removeControl(this.legendContainer[legendPosition])
            }
        })
    }

    removeLegends() {
        this.positions.forEach(legendPosition => {
            if (this.legends[legendPosition]) {
                Object.keys(this.legends[legendPosition]).forEach(key => {
                    if (this.legends[legendPosition][key]) {
                        this.legendContainer[legendPosition].removeChild(this.legends[legendPosition][key])
                    }
                })
            }
        })
        this.legends = {}
    }

    addLegend(key: string, title: string, data: ColorStops, format: string, legendPosition: string) {
        if (data) {
            if (!this.legends[legendPosition]) {
                this.legends[legendPosition] = {}
            }
            if (this.legends[legendPosition][key]) {
                while (this.legends[legendPosition][key].firstChild) {
                    this.legends[legendPosition][key].firstChild.remove()
                }
                this.isNewLegendCreated = false
                this.addValuesToLegend(title, data, format, this.legends[legendPosition][key])
            } else {
                this.isNewLegendCreated = true
                this.legends[legendPosition][key] = this.createLegendElement(title, data, format)
            }
        }
    }

    setLegends() {
        this.positions.forEach(legendPosition => {
            this.legendContainer[legendPosition].setLegends(this.legends[legendPosition], this.isNewLegendCreated)
        })
    }

    getDefaultOpacity(): number {
        return this.opacity
    }

    setOpacity(opacity: number) {
        this.opacity = opacity / 100
    }

    createLegendElement(title: string, data: ColorStops, format: string): HTMLElement {
        const d = document;
        const legend = d.createElement('div');
        legend.setAttribute("class", "mapbox-legend mapboxgl-ctrl-group");
        legend.setAttribute("style", `opacity: ${this.opacity};`);
        dragElement(legend)
        this.addValuesToLegend(title, data, format, legend)

        return legend
    }

    addValuesToLegend(title: string, data: ColorStops, format: string, legend: HTMLElement) {
        const d = document
        const titleElement = d.createElement('div');
        const titleText = d.createTextNode(title);
        titleElement.className = 'mapbox-legend-title';
        titleElement.appendChild(titleText);
        legend.appendChild(titleElement)

        data.forEach(({colorStop, color}) => {
            // Create line item
            const item = d.createElement('div');

            // Create color element and add to item
            const colorElement = d.createElement('span');
            colorElement.setAttribute("class", "mapbox-legend-color middle");
            colorElement.setAttribute("style", `background-color: ${color};`);
            item.appendChild(colorElement);

            // Create value element and add to item
            const valueElement = document.createElement('span');
            valueElement.setAttribute("class", "mapbox-legend-value middle");
            if (typeof colorStop === "number") {
                const valueText = d.createTextNode(valueFormatter.format(colorStop, format || LegendControl.DEFAULT_NUMBER_FORMAT));
                valueElement.appendChild(valueText);
            } else {
                const valueText = d.createTextNode(colorStop);
                valueElement.appendChild(valueText);
            }
            item.appendChild(valueElement);

            // Add line item to legend
            legend.appendChild(item)
        })
    }
}
