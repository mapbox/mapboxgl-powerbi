module powerbi.extensibility.visual {

    export class AutoZoomControl implements mapboxgl.IControl {
        private _map: mapboxgl.Map;
        private _container: HTMLElement;
        private _zoomPinButton: HTMLElement;

        public onAdd(map) {
            this._map = map;
            this._container = document.createElement('div');
            this._container.className = 'mapboxgl-ctrl-group';
            this._zoomPinButton = this._createButton('mapboxgl-ctrl-icon mapboxgl-ctrl-zoom-pin', 'Toggle auto zoom',
                                                     () => this._map.zoomIn());
            return this._zoomPinButton;
        }

        public onRemove() {
            this._container.parentNode.removeChild(this._container);
            this._map = undefined;
        }

        public getDefaultPosition() {
            return 'top-left';
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
