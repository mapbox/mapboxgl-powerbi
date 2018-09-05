module powerbi.extensibility.visual {

    declare var turf : any;
    declare var MapboxDraw : any;

    export module LassoDraw {

        export function create(filter: Filter) {

            // Set up cooperation between Mapbox GL Draw tools and our filtering component (filter.ts) by
            // "hooking" into Mapbox GL Draw functions, so that we can disable hover highlights during
            // drawing and not to clear selection on draw finish, etc.
            let original_polygon_onClick = MapboxDraw.modes.draw_polygon.onClick;
            MapboxDraw.modes.draw_polygon.onClick = function(state, e) {
                if (filter) {
                    filter.setSelectionInProgress(true);
                }
                return original_polygon_onClick.apply(this, arguments);
            }

            let original_polygon_onStop = MapboxDraw.modes.draw_polygon.onStop
            MapboxDraw.modes.draw_polygon.onStop = function(state) {
                if (filter) {
                    filter.setSelectionInProgress(false);
                }

                if (this.untoggleButton) {
                    this.untoggleButton();
                }

                return original_polygon_onStop.apply(this, arguments);
            }

            MapboxDraw.modes.draw_polygon.onSetup_original = MapboxDraw.modes.draw_polygon.onSetup
            MapboxDraw.modes.draw_polygon.onSetup = function(state) {
                if (filter) {
                    filter.setSelectionInProgress(true);
                }

                if (this.toggleButton) {
                    this.toggleButton();
                }

                if (this.onSetup_original) {
                    return this.onSetup_original.apply(this, arguments);
                }
            }

            // Lasso draw is based on polygon drawing tool, but some of its functions are going to be replaced
            const LassoDraw = {...MapboxDraw.modes.draw_polygon};

            // Toggle buttons
            MapboxDraw.modes.draw_polygon.toggleButton = function() {
                toggleIcon(MapboxDrawConstants.classes.CONTROL_BUTTON_POLYGON, true);
            }
            LassoDraw.toggleButton = function() {
                toggleIcon(MapboxDrawConstants.classes.CONTROL_BUTTON_LASSO, true);
            }

            // Untoggle buttons
            MapboxDraw.modes.draw_polygon.untoggleButton = function() {
                toggleIcon(MapboxDrawConstants.classes.CONTROL_BUTTON_POLYGON, false);
            }
            LassoDraw.untoggleButton = function() {
                toggleIcon(MapboxDrawConstants.classes.CONTROL_BUTTON_LASSO, false);
            }

            LassoDraw.onSetup_original = function() {
                const polygon = this.newFeature({
                    type: MapboxDrawConstants.geojsonTypes.FEATURE,
                    properties: {},
                    geometry: {
                        type: MapboxDrawConstants.geojsonTypes.POLYGON,
                        coordinates: [[]]
                    }
                });

                this.addFeature(polygon);

                this.clearSelectedFeatures();
                this.updateUIClasses({ mouse: MapboxDrawConstants.cursors.ADD });
                this.activateUIButton(MapboxDrawConstants.types.POLYGON);
                this.setActionableState({
                    trash: true
                });

                return {
                    polygon,
                    currentVertexPosition: 0,
                    dragMoving: false,
                    toggled: false,
                };
            };

            LassoDraw.onClick = function(state, e) {
                state.toggled = !state.toggled;

                if (!state.toggled) {
                    const factor = Math.min(Math.floor(this.map.getZoom()), 4);
                    let tolerance = (3 / ((this.map.getZoom() - factor) * 150)) - 0.001 // https://www.desmos.com/calculator/b3zi8jqskw
                    if (tolerance < 0 || !(isFinite(tolerance))) {
                        // Tolerance cannot be negative
                        tolerance = 0;
                    }
                    turf.simplify(state.polygon, {
                        tolerance: tolerance
                    });
                    this.fireUpdate();
                    this.changeMode(MapboxDrawConstants.modes.SIMPLE_SELECT, { featureIds: [state.polygon.id] });
                }

                if (filter) {
                    filter.setSelectionInProgress(state.toggled);
                }
            }

            LassoDraw.onMouseMove = LassoDraw.onTouchMove = function (state, e){
                state.dragMoving = true;
                if (state.toggled) {
                    this.updateUIClasses({ mouse: MapboxDrawConstants.cursors.ADD });
                    state.polygon.updateCoordinate(`0.${state.currentVertexPosition}`, e.lngLat.lng, e.lngLat.lat);
                    state.currentVertexPosition++;
                    state.polygon.updateCoordinate(`0.${state.currentVertexPosition}`, e.lngLat.lng, e.lngLat.lat);
                }
            }

            LassoDraw.fireUpdate = function() {
                this.map.fire(MapboxDrawConstants.events.UPDATE, {
                    action: MapboxDrawConstants.updateActions.MOVE,
                    features: this.getSelected().map(f => f.toGeoJSON())
                });
            };

            return LassoDraw;
        }

        export function makeIcon(surrogateControl: HTMLElement) {
            // Replace the line string tool icon and title to the lasso's icon and title
            try {
                let buttonClassName = MapboxDrawConstants.classes.CONTROL_BUTTON;
                buttonClassName += ` ${MapboxDrawConstants.classes.CONTROL_BUTTON_LASSO}`;
                surrogateControl.className = buttonClassName;
                surrogateControl.title = 'Lasso tool (l)';
            } catch (error) {
                // Failed to replace the icon and title of the line string tool
                // control to lasso
            }
        }

        function toggleIcon(className, toToggle) {
            try {
                const drawControlGroup = document.getElementsByClassName(className);
                const drawControl: any = drawControlGroup[0];
                const toggled = 'toggled';
                if (toToggle) {
                    drawControl.classList.add(toggled);
                } else {
                    drawControl.classList.remove(toggled)
                }
            } catch (error) {
                // Failed to toggle icon
            }
        }
    }
}
