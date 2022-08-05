import { RoleMap } from "./roleMap";
import { CircleSettings } from "./settings";

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
        }
    }

    private createControl(roleMap: RoleMap): HTMLElement {
        const d = document;
        const helper = this.createElement('div', '', this.container);
        const layerSources: { [key: string]: string[] } = {}

        this.map.getStyle().layers.forEach(layer => {
            if (layer["source-layer"] !== undefined) {
                if (!layerSources[layer["source-layer"]]) {
                    layerSources[layer["source-layer"]] = []
                }
                layerSources[layer["source-layer"]].push(layer.id)
            }
        })

        Object.entries(layerSources).forEach(entry => {
            const [sourceName, layers] = entry
            const item = d.createElement('div');

            const checkboxContainer = this.createElement('div', "checkbox-container", this.container);
            const checkbox = this.createElement('input', "default-style-checkbox", checkboxContainer);
            checkbox.setAttribute('type', "checkbox");
            checkbox.setAttribute('id', "checkbox");
            checkbox.setAttribute('checked', true)
            checkbox.addEventListener('change', () => {
                let visibility = (checkbox.checked === true) ? 'visible' : 'none';
                layers.forEach(layer => this.map.setLayoutProperty(layer, 'visibility', visibility))
            });
            item.appendChild(checkbox);

            const valueText = d.createTextNode(sourceName);
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
