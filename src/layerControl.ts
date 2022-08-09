import { RoleMap } from "./roleMap";

export class LayerControl implements mapboxgl.IControl {
    private container: HTMLElement;
    private helper: HTMLElement;
    private added: boolean;
    private map: mapboxgl.Map;
    private expanded = false;

    constructor() {
        this.added = false;
    }

    public onAdd(map): HTMLElement {
        this.added = true;
        this.map = map;
        this.container = document.createElement('div');
        this.container.className = 'mapboxgl-ctrl mapbox-helper';
        this.container.id = "mapbox-layer-control-container";
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
        return this.added;
    }

    public update(roleMap: RoleMap) {
        if (this.added) {
            if (this.container.hasChildNodes()) {
                this.container.removeChild(this.helper);
            }
            this.helper = this.createControl(roleMap);
            this.manageControlPanel();
        }
    }

    private manageControlPanel() {
        const drawControl = document.getElementById("drawControl");
        const drawControlHeight = drawControl ? drawControl.offsetHeight : 0;

        this.container.style.top = null;
        this.container.style.left = null;
        this.container.style.setProperty("--drawControlHeight", drawControlHeight + 20 + "px");
        this.container.style.position = "absolute";
    }

    private createControl(roleMap: RoleMap): HTMLElement {
        const layerSources = this.getLayerSources();
        const selectBox = this.createDropdown();
        const checkboxes = this.createDropdownOptions(layerSources);
        const helper = this.createElement('div', '', this.container);

        helper.appendChild(selectBox);
        helper.appendChild(checkboxes);

        return helper;
    }

    private createDropdown = () => {
        const d = document;
        const title = d.createTextNode("Select layers");
        const option = d.createElement('option');
        option.appendChild(title);

        const select = d.createElement('select');
        select.appendChild(option);

        const selectBox = d.createElement('div');
        selectBox.className = "select-box";
        selectBox.addEventListener("click", () => this.showDropdown());
        selectBox.appendChild(select);

        return selectBox;
    }

    private createDropdownOptions = (layerSources: { [key: string]: string[] }) => {
        const d = document;
        const checkboxes = d.createElement('div');
        checkboxes.id = "checkboxes"

        Object.entries(layerSources).sort((a, b) => a[0].localeCompare(b[0])).forEach(entry => {
            const [sourceName, layers] = entry;
            const item = d.createElement('div');
            item.className = "layer-source";

            const checkbox = this.createCheckBox(item);
            checkbox.addEventListener('change', () => {
                let visibility = (checkbox.checked === true) ? 'visible' : 'none';
                layers.forEach(layer => this.map.setLayoutProperty(layer, 'visibility', visibility));
            });
            item.appendChild(checkbox);

            const formattedSourceName = sourceName.replace(/[_-]/g, " ");
            const valueText = d.createTextNode(formattedSourceName);
            item.appendChild(valueText);
            checkboxes.appendChild(item);
        })

        return checkboxes;
    }

    private showDropdown = () => {
        var checkboxes = document.getElementById("checkboxes");
        if (!this.expanded) {
            checkboxes.style.display = "block";
            this.expanded = true;
        } else {
            checkboxes.style.display = "none";
            this.expanded = false;
        }
    }

    private getLayerSources = () => {
        const layerSources: { [key: string]: string[] } = {};

        this.map.getStyle().layers.forEach(layer => {
            if (!layer.id.includes("choropleth")) {
                if (layer["source-layer"] === undefined) {
                    layer["source-layer"] = "land";
                }
                if (!layerSources[layer["source-layer"]]) {
                    layerSources[layer["source-layer"]] = [];
                }
                layerSources[layer["source-layer"]].push(layer.id);
            }
        })

        return layerSources;
    }

    private createCheckBox = (container: HTMLElement) => {
        const checkbox = this.createElement('input', "default-style-checkbox", container);
        checkbox.setAttribute('type', "checkbox");
        checkbox.setAttribute('id', "checkbox");
        checkbox.setAttribute('checked', true);

        return checkbox;
    }

    private createElement = function (tagName: any, className?: string, container?: HTMLElement) {
        const el = document.createElement(tagName);
        if (className) el.className = className;
        if (container) container.appendChild(el);
        return el;
    };
}
