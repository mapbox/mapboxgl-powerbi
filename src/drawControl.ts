import { Filter } from "./filter"
import { constants } from "./constants"
import { MapboxMap } from "./visual"
//import { MapboxDraw, MapboxDrawConstants, LassoDraw } from "@mapbox/mapbox-gl-draw"
import MapboxDrawConstants from '@mapbox/mapbox-gl-draw/src/constants.js';
import { LassoDraw } from "./lassoDraw"
import MapboxDraw from '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.js';

import { polygon } from "@turf/helpers"
import bbox from "@turf/bbox"
import booleanContains from "@turf/boolean-contains"
import booleanOverlap from "@turf/boolean-overlap"

export class DrawControl implements mapboxgl.IControl {
    private draw: MapboxDraw;
    private filter: Filter;

    constructor(filter: Filter) {
        this.filter = filter
        // Override the line string tool with our lasso draw tool
        MapboxDraw.modes.draw_line_string = LassoDraw.create(this.filter);

        this.draw = new MapboxDraw({
            displayControlsDefault: false,
            // defaultMode: 'lasso',
            controls: {
                'polygon': true,
                'line_string': true     // Lasso is overriding the 'line_string' mode
            },
        });

    }

    manageHandlers(mapVisual: MapboxMap) {
        const map: mapboxgl.Map = mapVisual.getMap()

        map.on('draw.create', (e) => {

            map.doubleClickZoom.disable();

            // Get the feature the user has drawn
            const selection_poly = e.features[0];

            const selectFeature = function(sel_pol, feature) {
                if (feature.geometry.type === 'Point' && booleanContains(sel_pol, feature)) {
                    return true;
                }
                if ((feature.geometry.type === 'Polygon' || feature.geometry.type === 'Linestring') &&
                   (booleanOverlap(feature, sel_pol) || booleanContains(sel_pol, feature) ||
                    booleanContains(feature, sel_pol)
                )) {
                    return true;
                }

                return false;
            }

            // Create a bounding box from the user's polygon
            const polygonBoundingBox = bbox(selection_poly);
            const southWest = map.project([polygonBoundingBox[0], polygonBoundingBox[1]]);
            const northEast = map.project([polygonBoundingBox[2], polygonBoundingBox[3]]);

            // Find features in a layer the user selected bbox
            const layers = mapVisual.getExistingLayers();
            const layerIDs = layers.map(layer => layer.getId());
            const bbox_features : any[] = map.queryRenderedFeatures([southWest, northEast], {
                layers: layerIDs
            });

            let selectedFeatures = bbox_features.reduce(function (acc, feature) {
                if (selectFeature(selection_poly, feature)) {
                    acc.push(feature);
                    return acc;
                }

                // Split the feature into polygons, if it is a MultiPolygon
                if (feature.geometry.type === 'MultiPolygon') {
                    for (let poly of feature.geometry.coordinates) {
                        if (selectFeature(selection_poly, polygon(poly))) {
                            acc.push(feature);
                            return acc;
                        }
                    };
                }

                return acc;
            }, []);

            // Here are the selected features we can use for filters, selects, etc
            if (layers && layers.length > 0) {
                const roleMap = mapVisual.getRoleMap();
                if (selectedFeatures.length > constants.MAX_SELECTION_COUNT) {
                    selectedFeatures = selectedFeatures.slice(0, constants.MAX_SELECTION_COUNT);
                }
                layers.map( layer => {
                    this.filter.updateSelection(layer, selectedFeatures, roleMap)
                })
            }

            // Remove all features from the map after selection
            this.draw.deleteAll();
        });
    }

    onAdd(map: mapboxgl.Map): HTMLElement {
        const drawControlHTML: HTMLElement = this.draw.onAdd(map)

        // Replace the line string draw icon to the lasso icon
        const drawLineGroup = drawControlHTML.getElementsByClassName(MapboxDrawConstants.classes.CONTROL_BUTTON_LINE);
        const drawLineControl: HTMLElement = drawLineGroup[0] as HTMLElement;
        LassoDraw.makeIcon(drawLineControl);

        return drawControlHTML
    }

    onRemove(map: mapboxgl.Map) {
        this.draw.onRemove(map)
    }

    getDefaultPosition(): string {
        return 'top-left'
    }
}
