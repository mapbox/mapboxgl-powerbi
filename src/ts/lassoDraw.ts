module powerbi.extensibility.visual {

    declare var turf : any;
    declare var MapboxDraw : any;

    export module LassoDraw {

        export function create(filter: Filter) {
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
                return original_polygon_onStop.apply(this, arguments);
            }

            const LassoDraw: any = Object.assign({}, MapboxDraw.modes.draw_polygon);

            LassoDraw.onSetup = function() {
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
                    if (tolerance < 0) {
                        // Tolerance cannot be negative
                        tolerance = 0;
                    }
                    turf.simplify(state.polygon, {
                        mutate: true,
                        tolerance: tolerance,
                        highQuality: true
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

        export function makeIcon() {
            // Replace the line string tool icon and title to the lasso's icon and title
            try {
                let drawLineGroup = document.getElementsByClassName("mapbox-gl-draw_line");
                let drawLineControl: any = drawLineGroup[0];
                let buttonClassName = 'mapboxgl-ctrl-icon ';
                buttonClassName += 'mapboxgl-ctrl-draw-lasso';
                drawLineControl.className = buttonClassName;
                drawLineControl.title = 'Lasso tool (l)';
            } catch (error) {
                // Failed to replace the icon and title of the line string tool
                // control to lasso
            }
        }
    }
}
