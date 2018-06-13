module powerbi.extensibility.visual {

    export class AutoZoomControl implements mapboxgl.IControl {
        private host: IVisualHost;
        private map: mapboxgl.Map;
        private container: HTMLElement;
        private zoomPinButton: HTMLElement;
        private toggled: boolean;

        constructor(host) {
            this.host = host;
        }

        public onAdd(map) {
            this.toggled = false;
            this.map = map;
            this.container = document.createElement('div');
            this.container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';

            this.zoomPinButton = this.createButton(this.getButtonClass(), this.getButtonTitle(),
                () => {
                    this.toggled = !this.toggled;
                    this.zoomPinButton.className = this.getButtonClass();
                    this.zoomPinButton.title = this.getButtonTitle();
                    // Persist autozoom state into 'api' settings
                    this.host.persistProperties(<VisualObjectInstancesToPersist>{
                        merge: [{
                            objectName: "api",
                            selector: null,
                            properties: {
                                autozoom: !this.toggled,
                            }
                        }]
                    })
                });
            return this.container;
        }

        public onRemove() {
            this.container.parentNode.removeChild(this.container);
            this.map = undefined;
        }

        public getDefaultPosition() {
            return 'top-right';
        }

        public isPinned() {
            return this.toggled;
        }

        public setPin(state) {
            this.toggled = state;
            this.zoomPinButton.className = this.getButtonClass();
            this.zoomPinButton.title = this.getButtonTitle();
        }

        private createButton(className: string, ariaLabel: string, fn: () => any) {
            const button = this.createElement('button', className, this.container);
            button.type = 'button';
            button.setAttribute('aria-label', ariaLabel);
            button.title = ariaLabel;
            button.addEventListener('click', fn);
            return button;
        }

        private createElement = function (tagName: any, className?: string, container?: HTMLElement) {
            const el = window.document.createElement(tagName);
            if (className) el.className = className;
            if (container) container.appendChild(el);
            return el;
        };

        private getButtonClass() {
            let buttonClassName = constants.MAPBOX_CTRL_ICON_CLASS;
            if (this.toggled) {
                return buttonClassName + ' mapboxgl-ctrl-zoom-pin-toggled';
            }
            return buttonClassName + ' mapboxgl-ctrl-zoom-pin';
        }

        private getButtonTitle() {
            let title = 'autoZoom ';
            if (this.toggled) {
                return title + 'off';
            }
            return title + 'on';
        }
    }
}
