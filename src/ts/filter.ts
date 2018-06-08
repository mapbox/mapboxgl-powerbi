module powerbi.extensibility.visual {
    declare var turf : any;
    export class Filter {
        private box: HTMLElement;
        private start: any;
        private mapVisual: MapboxMap;
        private selectionInProgress: boolean;
        private selectionFinish: number;
        private dragScreenX: number;
        private dragScreenY: number;
        private dragStartTime: number;

        constructor(mapVisual: MapboxMap) {
            this.mapVisual = mapVisual

            document.addEventListener('mousedown', (e) => this.onMouseDown(e));
            document.addEventListener('mousemove', (e) => this.onMouseMove(e));
            document.addEventListener('mouseup', (e) => this.onMouseUp(e));
            document.addEventListener('keydown', (e) => this.onKeyDown(e));
            document.addEventListener('keyup', (e) => this.onKeyUp(e));
        }

        public isSelectionInProgress() {
            return this.selectionInProgress;
        }

        public setSelectionInProgress(inProgress) {
            this.selectionInProgress = inProgress;

            if (!inProgress) {
                this.selectionFinish = Date.now();
            }
        }

        public removeHighlightAndSelection(layers) {
            layers.map( layer => {
                layer.removeHighlight(this.mapVisual.getRoleMap());
            });
            this.mapVisual.clearSelection();
        }

        public manageHandlers() {

            const map = this.mapVisual.getMap();
            map.boxZoom.disable();

            const clickHandler = this.createClickHandler(this.mapVisual)
            map.off('click', clickHandler);
            map.on('click', clickHandler);

            const mouseMoveHandler = mapboxUtils.debounce((e) => {
                if (!this.mapVisual.hasSelection() && !this.selectionInProgress) {
                    const layers = this.mapVisual.getExistingLayers();
                    layers.map(layer => layer.hoverHighLight(e));
                }
            }, 12, true);

            const mouseLeaveHandler = mapboxUtils.debounce((e) => {
                if (!this.mapVisual.hasSelection() && !this.selectionInProgress) {
                    const layers = this.mapVisual.getExistingLayers();
                    layers.map(layer => layer.removeHighlight(this.mapVisual.getRoleMap()));
                }
            }, 12, true);

            const hoverHighLightLayers = [Circle.ID, Choropleth.ID];
            hoverHighLightLayers.map(hhLayer => {
                map.off('mousemove', hhLayer, mouseMoveHandler);
                map.on('mousemove', hhLayer, mouseMoveHandler);
                map.off('mouseleave', hhLayer, mouseLeaveHandler);
                map.on('mouseleave', hhLayer, mouseLeaveHandler);
            });

            const dragStartHandler = (e) => {
                this.dragScreenX = e.originalEvent.screenX;
                this.dragScreenY = e.originalEvent.screenY;
                this.dragStartTime = Date.now();
            }
            map.off('dragstart', dragStartHandler);
            map.on('dragstart', dragStartHandler);

            const dragEndHandler = (e) => {
                if (this.selectionInProgress) {
                    // Selection is still in progress, so there is nothing to do
                    return;
                }

                const dragAfterSelection = Date.now() - this.selectionFinish;
                if (dragAfterSelection < 300) {
                    // Skip the click if selection is still in progress
                    return;
                }

                const dragDuration = Date.now() - this.dragStartTime;
                if (dragDuration > 500) {
                    // Drag lasted long enough not to be handled as a click
                    return;
                }

                const radius = 5;
                if (this.dragScreenX - radius > e.originalEvent.screenX ||
                    this.dragScreenX + radius < e.originalEvent.screenX ||
                    this.dragScreenY - radius > e.originalEvent.screenY ||
                    this.dragScreenY + radius < e.originalEvent.screenY) {
                        // It was a real drag event
                        return;
                }

                // This drag event is considered to be click, so remove the highlight and selection
                const layers = this.mapVisual.getExistingLayers();
                this.removeHighlightAndSelection(layers);
            }
            map.off('dragend', dragEndHandler);
            map.on('dragend', dragEndHandler);
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
            if (!(e.shiftKey && e.button === 0) || !this.selectionInProgress) {
                // Selection is not in progress
                return;
            }

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
                if (this.start) {
                    this.finish([this.start, this.mousePos(e)]);
                    return;
                }
            }
        }

        onKeyDown(e) {
            // If the ESC key is pressed
            if (e.keyCode === 27) this.finish(null);
        }

        onKeyUp(e) {
            // Cancel selection when shift is released
            if (e.keyCode === 16) {
                setTimeout(() => {
                    this.finish(null);
                }, 300);
            }
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
                this.selectionFinish = Date.now();
                const layers = this.mapVisual.getExistingLayers();
                if (layers && layers.length > 0) {
                    const roleMap = this.mapVisual.getRoleMap();
                    layers.map( layer => {
                        let features = map.queryRenderedFeatures(bbox, { layers: [ layer.getId() ] });
                        layer.updateSelection(
                            features,
                            roleMap);
                    });

                }
            }

            map.dragPan.enable();
            this.start = null;
        }

        createClickHandler(mapVisual: MapboxMap) {
            let onClick : Function = (e) => {
                const originalEvent = e.originalEvent;
                if (originalEvent.shiftKey && originalEvent.button === 0 || this.selectionInProgress) {
                    // Selection is considered to be still in progress
                    return
                };

                // This is kind of a hack, because we have multiple click handlers installed. For example
                // one is installed here, but another one is installed in lassoDraw.ts, and it might
                // happen that the click handler in lassoDraw.ts gets sooner notified than this one. And
                // in those cases selectionInProgress is already false, but we definitely don't want to
                // remove the selection as a response to that click which actually applied the selection.
                const clickAfterSelection = Date.now() - this.selectionFinish;
                if (clickAfterSelection < 300) {
                    // Skip the click if selection is still in progress
                    return;
                }

                const map = mapVisual.getMap();
                // map.queryRenderedFeatures fails
                // when option.layers contains an id which is not on the map
                const layers = mapVisual.getExistingLayers();
                const layerIDs = layers.map(layer => layer.getId());
                const radius = 5
                let minpoint = new Array(e.point['x'] - radius, e.point['y'] - radius)
                let maxpoint = new Array(e.point['x'] + radius, e.point['y'] + radius)
                let features : any = map.queryRenderedFeatures([minpoint, maxpoint], {
                    "layers": layerIDs
                });

                if (features
                    && features.length
                    && features[0]
                    && features[0].geometry
                    && features[0].geometry.coordinates
                    && !mapVisual.hasSelection()
                ) {
                    mapVisual.hideTooltip()
                }
                this.removeHighlightAndSelection(layers);
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
    }
}
