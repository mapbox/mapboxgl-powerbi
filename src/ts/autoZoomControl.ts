module powerbi.extensibility.visual {

    export class AutoZoomControl implements mapboxgl.IControl {
        private map: mapboxgl.Map;
        private container: HTMLElement;
        private zoomPinButton: HTMLElement;
        private toggled: boolean;

        public onAdd(map) {
            this.toggled = false;
            this.map = map;
            this.container = document.createElement('div');
            this.container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
            this.zoomPinButton = this.createButton('mapboxgl-ctrl-icon mapboxgl-ctrl-zoom-pin', 'Toggle auto zoom',
                                                     () => {
                                                        this.toggled = !this.toggled;
                                                        let buttonClassName = 'mapboxgl-ctrl-icon mapboxgl-ctrl-zoom-pin';
                                                        if (this.toggled) {
                                                            buttonClassName = 'mapboxgl-ctrl-icon mapboxgl-ctrl-zoom-pin-toggled';
                                                        }
                                                        this.zoomPinButton.className = buttonClassName;
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

        private createButton(className: string, ariaLabel: string, fn: () => any) {
            const a = this.createElement('button', className, this.container);
            a.type = 'button';
            a.setAttribute('aria-label', ariaLabel);
            a.addEventListener('click', fn);
            return a;
        }

        private createElement = function (tagName: any, className?: string, container?: HTMLElement) {
            const el = window.document.createElement(tagName);
            if (className) el.className = className;
            if (container) container.appendChild(el);
            return el;
        };
    }
}
