module powerbi.extensibility.visual {
    declare var fastDeepEqual: any;
    export module FeatureOps {
        function isFeatureEqual(feature: GeoJSON.Feature<mapboxgl.GeoJSONGeometry>, otherFeature: GeoJSON.Feature<mapboxgl.GeoJSONGeometry>): boolean {
            return fastDeepEqual(feature.properties, otherFeature.properties)
        }

        export function isInclude(featureArray: GeoJSON.Feature<mapboxgl.GeoJSONGeometry>[], otherFeature: GeoJSON.Feature<mapboxgl.GeoJSONGeometry>): boolean {
            return featureArray.some(feature => isFeatureEqual(feature, otherFeature))
        }
    }
}
