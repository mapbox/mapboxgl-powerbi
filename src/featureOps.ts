import { GeoJSONGeometry } from "@mapbox/geojson-types"
import * as mapboxgl from "mapbox-gl"

declare var fastDeepEqual: any;
export module FeatureOps {
    function isFeatureEqual(feature: GeoJSON.Feature<GeoJSONGeometry>, otherFeature: GeoJSON.Feature<GeoJSONGeometry>): boolean {
        return fastDeepEqual(feature.properties, otherFeature.properties)
    }

    export function isInclude(featureArray: GeoJSON.Feature<GeoJSONGeometry>[], otherFeature: GeoJSON.Feature<GeoJSONGeometry>): boolean {
        return featureArray.some(feature => isFeatureEqual(feature, otherFeature))
    }
}
