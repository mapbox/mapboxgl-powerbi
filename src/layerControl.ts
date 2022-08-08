import { RoleMap } from "./roleMap";

export class LayerControl implements mapboxgl.IControl {
    private container: HTMLElement;
    private helper: HTMLElement;
    private added: boolean;
    private map: mapboxgl.Map;

    constructor() {
        this.added = false;
    }

    public onAdd(map): HTMLElement {
        this.added = true;
        this.map = map
        this.container = document.createElement('div');
        this.container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group mapbox-helper'
        this.container.id = "mapbox-layer-control-container"
        return this.container;
    }

    public onRemove() {
        this.added = false;
        this.map = undefined;
        this.container.parentNode.removeChild(this.container);
        this.container = undefined;
    }

    public getDefaultPosition() {
        return 'top-left';
    }

    public isAdded(): boolean {
        return this.added
    }

    public update(roleMap: RoleMap) {
        if (this.added) {
            if (this.container.hasChildNodes()) {
                this.container.removeChild(this.helper);
            }
            this.helper = this.createControl(roleMap);
            this.manageControlPanel()
        }
    }

    private manageControlPanel() {
        const drawControl = document.getElementById("drawControl")
        const drawControlHeight = drawControl ? drawControl.offsetHeight : 0

        this.container.style.top = null;
        this.container.style.left = null;
        this.container.style.setProperty("--drawControlHeight", drawControlHeight + 20 + "px");
        this.container.style.position = "absolute";
    }

    private createControl(roleMap: RoleMap): HTMLElement {
        const d = document;
        const helper = this.createElement('div', '', this.container);
        const layerSources: { [key: string]: string[] } = {}

        this.map.getStyle().layers.forEach(layer => {
            if (!layer.id.includes("choropleth")) {
                if (layer["source-layer"] === undefined) {
                    layer["source-layer"] = "land"
                }
                if (!layerSources[layer["source-layer"]]) {
                    layerSources[layer["source-layer"]] = []
                }
                layerSources[layer["source-layer"]].push(layer.id)
            }
        })

        Object.entries(layerSources).sort((a, b) => a[0].localeCompare(b[0])).forEach(entry => {
            const [sourceName, layers] = entry
            const item = d.createElement('div');
            item.className = "layer-source"

            const checkbox = this.createElement('input', "default-style-checkbox", item);
            checkbox.setAttribute('type', "checkbox");
            checkbox.setAttribute('id', "checkbox");
            checkbox.setAttribute('checked', true)
            checkbox.addEventListener('change', () => {
                let visibility = (checkbox.checked === true) ? 'visible' : 'none';
                layers.forEach(layer => this.map.setLayoutProperty(layer, 'visibility', visibility))
            });
            item.appendChild(checkbox);

            const formattedSourceName = sourceName.replace(/[_-]/g, " ")
            const valueText = d.createTextNode(formattedSourceName);
            item.appendChild(valueText);

            helper.appendChild(item);
        })

        return helper
    }

    private createElement = function (tagName: any, className?: string, container?: HTMLElement) {
        const el = document.createElement(tagName);
        if (className) el.className = className;
        if (container) container.appendChild(el);
        return el;
    };
}
