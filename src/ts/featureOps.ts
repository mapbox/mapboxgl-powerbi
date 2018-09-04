module powerbi.extensibility.visual {
    declare var GeojsonEquality: any;
    export module FeatureOps {
        function isFeatureEqual(feature: GeoJSON.Feature<mapboxgl.GeoJSONGeometry>, otherFeature: GeoJSON.Feature<mapboxgl.GeoJSONGeometry>): boolean {
            var eq = new GeojsonEquality();
            return eq.compare(feature, otherFeature)
        }

        export function isInclude(featureArray: GeoJSON.Feature<mapboxgl.GeoJSONGeometry>[], otherFeature: GeoJSON.Feature<mapboxgl.GeoJSONGeometry>): boolean {
            return featureArray.some(feature => isFeatureEqual(feature, otherFeature))
        }
    }
}
