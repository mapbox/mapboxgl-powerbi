module powerbi.extensibility.visual {
    declare var turf : any;
    export module filter {
        export function createClickHandler(mapVisual: MapboxMap) {
            let onClick : Function = function(e) {
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
                        center: getCenter(features[0]),
                        zoom: map.getZoom() + 1,
                        duration: 1000
                    });
                }
            }

            return onClick
        };

        function getCenter(feature) {
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
