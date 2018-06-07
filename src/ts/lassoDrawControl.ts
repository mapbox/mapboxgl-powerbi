module powerbi.extensibility.visual {

    export class LassoDrawControl implements mapboxgl.IControl {
        private map: mapboxgl.Map;
        private container: HTMLElement;
        private lassoDrawButton: HTMLElement;
        private toggled: boolean;
        private draw: any;

        constructor(draw: any) {
            this.draw = draw;
        }

        public onAdd(map) {
            this.toggled = false;
            this.map = map;
            this.container = document.createElement('div');
            this.container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';

            this.lassoDrawButton = this.createButton(this.getButtonClass(), this.getButtonTitle(),
                () => {
                    // this.toggled = !this.toggled;
                    // if (this.toggled && this.draw) {
                    console.log('changing draw mode')
                    this.draw.changeMode('lasso');
                    // }
                    this.lassoDrawButton.className = this.getButtonClass();
                    this.lassoDrawButton.title = this.getButtonTitle();
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

        // public isPinned() {
        //     return this.toggled;
        // }

        // public setPin(state) {
        //     this.toggled = state;
        //     this.lassoDrawButton.className = this.getButtonClass();
        //     this.lassoDrawButton.title = this.getButtonTitle();
        // }

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
            let buttonClassName = 'mapboxgl-ctrl-icon ';
            if (this.toggled) {
                return buttonClassName + 'mapboxgl-ctrl-draw-lasso-toggled';
            }
            return buttonClassName + 'mapboxgl-ctrl-draw-lasso';
        }

        private getButtonTitle() {
            let title = 'lasso draw ';
            if (this.toggled) {
                return title + 'off';
            }
            return title + 'on';
        }
    }
}
