module powerbi.extensibility.visual {

    export class AutoZoomControl implements mapboxgl.IControl {
        private _map: mapboxgl.Map;
        private _container: HTMLElement;
        private _zoomPinButton: HTMLElement;
        private _toggled: boolean;

        public onAdd(map) {
            this._toggled = false;
            this._map = map;
            this._container = document.createElement('div');
            this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
            this._zoomPinButton = this._createButton('mapboxgl-ctrl-icon mapboxgl-ctrl-zoom-pin', 'Toggle auto zoom',
                                                     () => {
                                                        this._toggled = !this._toggled;
                                                        let buttonClassName = 'mapboxgl-ctrl-icon mapboxgl-ctrl-zoom-pin';
                                                        if (this._toggled) {
                                                            buttonClassName = 'mapboxgl-ctrl-icon mapboxgl-ctrl-zoom-pin-toggled';
                                                        }
                                                        this._zoomPinButton.className = buttonClassName;
                                                     });
            return this._container;
        }

        public onRemove() {
            this._container.parentNode.removeChild(this._container);
            this._map = undefined;
        }

        public getDefaultPosition() {
            return 'top-right';
        }

        private _createButton(className: string, ariaLabel: string, fn: () => any) {
            const a = this._createElement('button', className, this._container);
            a.type = 'button';
            a.setAttribute('aria-label', ariaLabel);
            a.addEventListener('click', fn);
            return a;
        }

        private _createElement = function (tagName: any, className?: string, container?: HTMLElement) {
            const el = window.document.createElement(tagName);
            if (className) el.className = className;
            if (container) container.appendChild(el);
            return el;
        };
    }
}
