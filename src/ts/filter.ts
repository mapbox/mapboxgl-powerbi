module powerbi.extensibility.visual {
    declare var turf : any;
    export class Filter {
        private box: HTMLElement;
        private start: any;
        private mapVisual: MapboxMap;
        private selectionInProgress: boolean;

        constructor(mapVisual: MapboxMap) {
            this.mapVisual = mapVisual

            document.addEventListener('mousedown', (e) => this.onMouseDown(e));
            document.addEventListener('mousemove', (e) => this.onMouseMove(e));
            document.addEventListener('mouseup', (e) => this.onMouseUp(e));
            document.addEventListener('keydown', (e) => this.onKeyDown(e));
            document.addEventListener('keyup', (e) => this.onKeyUp(e));
        }

        public manageHandlers() {

            const map = this.mapVisual.getMap();
            map.boxZoom.disable();

            const clickHandler = this.createClickHandler(this.mapVisual)
            map.off('click', clickHandler);
            map.on('click', clickHandler);
        }

        // Return the xy coordinates of the mouse position
        mousePos(e) {
            const map = this.mapVisual.getMap();
            let canvas = map.getCanvasContainer();
            let rect = canvas.getBoundingClientRect();
            return new mapboxgl.Point(
                e.clientX - rect.left - canvas.clientLeft,
                e.clientY - rect.top - canvas.clientTop
                );
        }

        onMouseDown(e) {
            // Continue the rest of the function if the shiftkey is pressed.
            if (!(e.shiftKey && e.button === 0) || !this.mapVisual) return;
            const map = this.mapVisual.getMap();
            this.selectionInProgress = true;

            // Disable default drag zooming when the shift key is held down.
            map.dragPan.disable();

            // Capture the first xy coordinates
            this.start = this.mousePos(e);
        }

        onMouseMove(e) {
            // Capture the ongoing xy coordinates
            if (!(e.shiftKey && e.button === 0) || !this.selectionInProgress) return;
            let current = this.mousePos(e);
            const map = this.mapVisual.getMap();
            let canvas = map.getCanvasContainer();

            // Append the box element if it doesnt exist
            if (!this.box) {
                this.box = document.createElement('div');
                this.box.classList.add('boxdraw');
                canvas.appendChild(this.box);
            }

            let minX = Math.min(this.start.x, current.x),
                maxX = Math.max(this.start.x, current.x),
                minY = Math.min(this.start.y, current.y),
                maxY = Math.max(this.start.y, current.y);

            // Adjust width and xy position of the box element ongoing
            let pos = 'translate(' + minX + 'px,' + minY + 'px)';
            this.box.style.transform = pos;
            this.box.style.webkitTransform = pos;
            this.box.style.width = maxX - minX + 'px';
            this.box.style.height = maxY - minY + 'px';
        }

        onMouseUp(e) {
            // Capture xy coordinates
            if (this.selectionInProgress) {
                this.finish([this.start, this.mousePos(e)]);
            }
        }

        onKeyDown(e) {
            // If the ESC key is pressed
            if (e.keyCode === 27) this.finish(null);
        }

        onKeyUp(e) {
            // Cancel selection when shift is released
            if (e.keyCode === 16) this.finish(null);

        }

        finish(bbox) {
            this.selectionInProgress = false;
            const map = this.mapVisual.getMap();
            if (this.box) {
                this.box.parentNode.removeChild(this.box);
                this.box = null;
            }

            // If bbox exists. use this value as the argument for `queryRenderedFeatures`
            if (bbox) {
                const layers = this.mapVisual.getExistingLayers();
                if (layers && layers.length > 0) {
                    const settings = this.mapVisual.getSettings();
                    const roleMap = this.mapVisual.getRoleMap();    
                    layers.map( layer => {
                        let features = map.queryRenderedFeatures(bbox, { layers: [ layer.getId() ] });
                        layer.updateSelection(features, roleMap, settings);
                    });

                }
            }

            map.dragPan.enable();
        }

        createClickHandler(mapVisual: MapboxMap) {
            let onClick : Function = function(e) {
                const originalEvent = e.originalEvent;
                if (originalEvent.shiftKey && originalEvent.button === 0) { return };
                const map = mapVisual.getMap()

                // map.queryRenderedFeatures fails
                // when option.layers contains an id which is not on the map
                const layers = mapVisual.getExistingLayers().map(layer => layer.getId())

                const radius = 5
                let minpoint = new Array(e.point['x'] - radius, e.point['y'] - radius)
                let maxpoint = new Array(e.point['x'] + radius, e.point['y'] + radius)
                let features : any = map.queryRenderedFeatures([minpoint, maxpoint], {
                    layers
                });

                if (features
                    && features.length
                    && features[0]
                    && features[0].geometry
                    && features[0].geometry.coordinates
                ) {
                    mapVisual.hideTooltip()
                    map.easeTo({
                        center: this.getCenter(features[0]),
                        zoom: map.getZoom() + 1,
                        duration: 1000
                    });
                }
            }

            return onClick
        };

        getCenter(feature) {
            if (feature && feature.geometry) {
                if (feature.geometry.type == 'Point') {
                    return feature.geometry.coordinates
                }

                const bbox = turf.bbox(feature)

                const pointCollection = turf.helpers.featureCollection([
                    turf.helpers.point( [bbox[0], bbox[1]]),
                    turf.helpers.point( [bbox[2], bbox[3]]),
                ]);

                const center = turf.center(pointCollection);
                return center.geometry.coordinates
            }
        }

        //
        // export const WORLD_BOUNDS = [-180.0000, -90.0000, 180.0000, 90.0000];
        // export const HIGHLIGHT_COLOR = "#627BC1";
    }
}
