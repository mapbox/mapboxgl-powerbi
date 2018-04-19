module powerbi.extensibility.visual {
    import DataViewObjectsParser = powerbi.extensibility.utils.dataview.DataViewObjectsParser;
    declare var mapbox: any;
    export interface MapboxData {
        features: any[];
    }

    export class MapboxSettings extends DataViewObjectsParser {
        public api: APISettings = new APISettings();
        public cluster: ClusterSettings = new ClusterSettings();
        public heatmap: HeatmapSettings = new HeatmapSettings();
        public circle: CircleSettings = new CircleSettings();
        public choropleth: ChoroplethSettings = new ChoroplethSettings();

        public static enumerateObjectInstances(
            dataViewObjectParser: DataViewObjectsParser,
            options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {

                let settings: MapboxSettings = <MapboxSettings>dataViewObjectParser;
                let instanceEnumeration = DataViewObjectsParser.enumerateObjectInstances(dataViewObjectParser, options);

                switch (options.objectName) {
                    case 'api':
                    case 'choropleth': {
                        return settings[options.objectName].enumerateObjectInstances(instanceEnumeration);
                    }
                    default: {
                        return instanceEnumeration;
                    }
                }
        }
    }

    export class APISettings {
        public accessToken: string = "";
        public style: string = "mapbox:\/\/styles\/mapbox\/dark-v9?optimize=true";
        public styleUrl: string = "";

        public enumerateObjectInstances(objectEnumeration) {
            let instances = objectEnumeration.instances;
            let properties = instances[0].properties;

            // Hide / show custom map style URL control
            if (properties.style != 'custom') {
                properties.styleUrl = "";
                delete properties.styleUrl
            } else if (!properties.styleUrl) {
                properties.styleUrl = "";
            }

            return { instances }
        }
    }

    export class CircleSettings {
        public show: boolean = true;
        public radius: number = 3;
        public scaleFactor: number = 5;
        public minColor: string = "#ffffcc";
        public medColor: string = "#41b6c4";
        public maxColor: string = "#253494";
        public blur: number = 0.0;
        public opacity: number = 100;
        public strokeWidth: number = 1;
        public strokeColor: string = "black";
        public strokeOpacity: number = 50;
        public minZoom: number = 0;
        public maxZoom: number = 22;
    }

    export class HeatmapSettings {
        public show: boolean = false;
        public radius: number = 5;
        public intensity: number = 0.5;
        public opacity: number = 100;
        public minColor: string = "#0571b0";
        public medColor: string = "#f7f7f7";
        public maxColor: string = "#ca0020";
        public minZoom: number = 0;
        public maxZoom: number = 22;
    }

    export class ClusterSettings {
        public show: boolean = false;
        public aggregation: string = "Count";
        public clusterRadius: number = 50;
        public clusterMaxZoom: number = 12;
        public minColor: string = "#ffffcc";
        public maxColor: string = "#253494";
        public radius: number = 10;
        public blur: number = 30;
        public strokeWidth: number = 1;
        public strokeColor: string = "black";
        public strokeOpacity: number = 50;
        public minZoom: number = 0;
        public maxZoom: number = 22;
    }

    export class ChoroplethSettings {
        static readonly GLOBAL_COUNTRIES_TILE_URL = "mapbox://mapbox.pbi-countries-v1";
        static readonly US_STATES_TILE_URL = "mapbox://mapbox.pbi-us-states-v1";
        static readonly US_COUNTIES_TILE_URL = "mapbox://mapbox.pbi-us-counties-v1";
        static readonly US_POSTCODES_TILE_URL = "mapbox://mapbox.pbi-us-postcodes-v1";

        static readonly PREDEFINED_VECTOR_PROPERTY = "name";

        public show: boolean = false;
        public minColor: string = "#0571b0";
        public medColor: string = "#f7f7f7";
        public maxColor: string = "#ca0020";
        public minZoom: number = 0;
        public maxZoom: number = 22;
        public data: string = ChoroplethSettings.US_STATES_TILE_URL;  // Let US states be the default

        public vectorTileUrl: string = 'mapbox://';
        public sourceLayer: string = '';
        public vectorProperty: string = '';

        public display(): boolean {
            return this.show &&
                this.vectorProperty != "" &&
                this.sourceLayer != "" &&
                this.vectorTileUrl != ""
        }

        public enumerateObjectInstances(objectEnumeration) {
            let instances = objectEnumeration.instances;
            let properties = instances[0].properties;

            if (properties.data !== 'custom') {
                // Hide custom vector tile URL, source layer and vector property controls, since a
                // predefined boundary is selected
                delete properties.vectorTileUrl;
                delete properties.sourceLayer;
                delete properties.vectorProperty;
            }

            return { instances };
        }
    }
}
