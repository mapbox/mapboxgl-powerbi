module powerbi.extensibility.visual {
    export class Filter {
        private box: HTMLElement;
        private start: any;
        private mapVisual: MapboxMap;
        private selectionInProgress: boolean;
        private selectionFinish: number;
        private dragScreenX: number;
        private dragScreenY: number;
        private dragStartTime: number;
        private selectionManager: ISelectionManager;
        private host: IVisualHost;
        private categories: any;
        private prevSelectionByLayer: { [layerId: string]: GeoJSON.Feature<mapboxgl.GeoJSONGeometry>[] };


        constructor(mapVisual: MapboxMap, host: IVisualHost) {
            this.mapVisual = mapVisual
            this.selectionManager = host.createSelectionManager();
            this.host = host;
            this.prevSelectionByLayer = {};

            document.addEventListener('mousedown', (e) => this.onMouseDown(e));
            document.addEventListener('mousemove', (e) => this.onMouseMove(e));
            document.addEventListener('mouseup', (e) => this.onMouseUp(e));
            document.addEventListener('keydown', (e) => this.onKeyDown(e));
            document.addEventListener('keyup', (e) => this.onKeyUp(e));
        }

        public setCategories(categories: any) {
            this.categories = categories
        }

        public clearSelection() {
            this.selectionManager.clear();
        }

        public hasSelection() {
            return this.selectionManager.hasSelection();
        }

        public addSelection(values, role?) {
            let indexes = values;
            let category = this.categories[0];

            if (role) {
                category = this.categories.find(cat => {
                    return cat.source.displayName == role.displayName;
                })

                indexes = values.map(value => category.values.indexOf(value));
            }

            const selectors = indexes
                .filter(index => {
                    return (index >= 0 && index < category.values.length)
                })
                .map(index => {
                    return this.host.createSelectionIdBuilder()
                        .withCategory(category, index).createSelectionId();
                })

            this.selectionManager.select(selectors, false);
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
            layers.map(layer => {
                layer.removeHighlight(this.mapVisual.getRoleMap());
            });
            this.clearSelection();
        }

        public manageHandlers() {

            const map = this.mapVisual.getMap();

            // Disable box zoom in favour of rectangular selection (Shift + drag)
            map.boxZoom.disable();

            const clickHandler = this.createClickHandler(this.mapVisual)
            map.off('click', clickHandler);
            map.on('click', clickHandler);

            const mouseMoveHandler = mapboxUtils.debounce((e) => {
                if (!this.hasSelection() && !this.selectionInProgress) {
                    const layers = this.mapVisual.getExistingLayers();
                    layers.map(layer => layer.hoverHighLight(e));
                }
            }, 12, true);

            const mouseLeaveHandler = mapboxUtils.debounce((e) => {
                if (!this.hasSelection() && !this.selectionInProgress) {
                    const layers = this.mapVisual.getExistingLayers();
                    layers.map(layer => layer.removeHighlight(this.mapVisual.getRoleMap()));
                }
            }, 12, true);

            const hoverHighLightLayers = [Circle.ID, Choropleth.ID, Choropleth.ExtrusionID];
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

        onMouseDown(e: MouseEvent) {
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
                    layers.map(layer => {
                        let features = map.queryRenderedFeatures(bbox, { layers: [layer.getId()] });
                        this.updateSelection(layer, features, roleMap);
                    });

                }
            }

            map.dragPan.enable();
            this.start = null;
        }

        public updateSelection(layer: Layer, features: GeoJSON.Feature<mapboxgl.GeoJSONGeometry>[], roleMap: any, toggleSelection = false) {
            const layerId = layer.getId();
            if (toggleSelection && this.prevSelectionByLayer[layerId]) {
                const toAdd = features.filter(feature => !FeatureOps.isInclude(this.prevSelectionByLayer[layerId], feature))
                const toKeep = this.prevSelectionByLayer[layerId].filter(feature => !FeatureOps.isInclude(features, feature))
                features = toKeep.concat(toAdd)
            }

            layer.updateSelection(features, roleMap);
            this.prevSelectionByLayer[layerId] = [...features]
        }

        public getSelectionOpacity(opacity) {
            opacity = opacity / 100
            if (this.hasSelection()) {
                opacity = 0.5 * opacity;
            }
            return opacity
        }

        private static isToggleClick(e: MouseEvent) {
            if (navigator.platform.toUpperCase().indexOf('MAC') >= 0) {
                return e.metaKey && e.button === 0
            }
            else if (navigator.platform.toUpperCase().indexOf('WIN') >= 0) {
                return e.ctrlKey && e.button === 0
            }

            return (e.metaKey || e.ctrlKey) && e.button === 0
        }

        createClickHandler(mapVisual: MapboxMap) {
            let onClick: Function = (e) => {
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

                const radius = 0
                let minpoint = new Array(e.point['x'] - radius, e.point['y'] - radius)
                let maxpoint = new Array(e.point['x'] + radius, e.point['y'] + radius)

                const map = mapVisual.getMap();
                const roleMap = this.mapVisual.getRoleMap();
                const layers = mapVisual.getExistingLayers();

                this.removeHighlightAndSelection(layers);

                const isToggleClick = Filter.isToggleClick(originalEvent)

                // map.queryRenderedFeatures fails
                // when option.layers contains an id which is not on the map
                layers.forEach(layer => {

                    // Clicking without holding down ctrl/cmd clears the previous selection
                    if (!isToggleClick) {
                        this.prevSelectionByLayer[layer.getId()] = []
                    }

                    let features: any = map.queryRenderedFeatures([minpoint, maxpoint], {
                        "layers": [layer.getId()]
                    });

                    if (features
                        && features.length
                        && features[0]
                        && features[0].geometry
                        && features[0].geometry.coordinates
                    ) {
                        mapVisual.hideTooltip()
                        this.updateSelection(layer, features, roleMap, isToggleClick)
                    }
                    else if (isToggleClick) {
                        // Clicking on an empty space while holding down ctrl/cmd
                        // should not clear the previous selection
                        // (removeHighlightAndSelection has already cleared it)
                        // so it must be added back.
                        this.updateSelection(layer, [], roleMap, isToggleClick)
                    }
                });
            }

            return onClick
        };
    }
}
