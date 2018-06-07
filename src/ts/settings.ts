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
        public raster: WMSSettings = new WMSSettings();
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
        public style: string = "mapbox:\/\/styles\/mapbox\/light-v9?optimize=true";
        public styleUrl: string = "";
        public zoom : number = 0;
        public startLong : number = 0;
        public startLat : number = 0;
        public autozoom : boolean = true;

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
        public opacity: number = 80;
        public strokeWidth: number = 1;
        public strokeColor: string = "#bdbdbd";
        public strokeOpacity: number = 50;
        public minZoom: number = 0;
        public maxZoom: number = 22;
    }
    export class WMSSettings {
        public show: boolean = false;
        public url: string = "https://geodata.state.nj.us/imagerywms/Natural2015?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&width=256&height=256&layers=Natural2015";
        public opacity: number = 80;
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
        public strokeColor: string = "#bdbdbd";
        public strokeOpacity: number = 50;
        public minZoom: number = 0;
        public maxZoom: number = 22;
    }

    export class ChoroplethSettings {
        static readonly GLOBAL_COUNTRIES_TILE_URL = "mapbox://mapbox.pbi-countries-v1";
        static readonly US_STATES_TILE_URL = "mapbox://mapbox.pbi-us-states-v1";
        static readonly US_COUNTIES_TILE_URL = "mapbox://mapbox.pbi-us-counties-v1";
        static readonly US_POSTCODES_TILE_URL = "mapbox://mapbox.pbi-us-postcodes-v1";

        static readonly GLOBAL_COUNTRIES_SOURCE_LAYER = "pbi-countries";
        static readonly US_STATES_SOURCE_LAYER = "pbi-us-states";
        static readonly US_COUNTIES_SOURCE_LAYER = "pbi-us-counties";
        static readonly US_POSTCODES_SOURCE_LAYER = "pbi-us-postcodes";

        static readonly PREDEFINED_VECTOR_PROPERTY = "name";

        public show: boolean = false;
        public minColor: string = "#edf8b1";
        public medColor: string = "#7fcdbb";
        public maxColor: string = "#2c7fb8";
        public minZoom: number = 0;
        public maxZoom: number = 22;
        public data: string = ChoroplethSettings.US_STATES_TILE_URL;  // Let US states be the default

        public vectorTileUrl: string = ChoroplethSettings.GLOBAL_COUNTRIES_TILE_URL;
        public sourceLayer: string = ChoroplethSettings.GLOBAL_COUNTRIES_SOURCE_LAYER;
        public vectorProperty: string = ChoroplethSettings.PREDEFINED_VECTOR_PROPERTY;
        public opacity: number = 80;
        public outlineColor: string = "#bdbdbd";
        public outlineWidth: number = 1;
        public outlineOpacity: number = 50;


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

            instances[0].validValues = {
                minZoom: {
                    numberRange: {
                        min: 0,
                        max: 22,
                    }
                },
                maxZoom: {
                    numberRange: {
                        min: 0,
                        max: 22,
                    }
                },
                opacity: {
                    numberRange: {
                        min: 0,
                        max: 100,
                    }
                },
                outlineOpacity: {
                    numberRange: {
                        min: 0,
                        max: 100,
                    }
                },
                outlineWidth: {
                    numberRange: {
                        min: 0,
                        max: 1000,
                    }
                }
            }

            return { instances };
        }

        public static fillPredefinedProperties(choroSettings) {
            if (choroSettings.data !== 'custom') {
                switch (choroSettings.data) {
                    case ChoroplethSettings.GLOBAL_COUNTRIES_TILE_URL:
                        choroSettings.sourceLayer = ChoroplethSettings.GLOBAL_COUNTRIES_SOURCE_LAYER;
                        break;
                    case ChoroplethSettings.US_STATES_TILE_URL:
                        choroSettings.sourceLayer = ChoroplethSettings.US_STATES_SOURCE_LAYER;
                        break;
                    case ChoroplethSettings.US_POSTCODES_TILE_URL:
                        choroSettings.sourceLayer = ChoroplethSettings.US_POSTCODES_SOURCE_LAYER;
                        break;
                }

                choroSettings.vectorTileUrl = choroSettings.data;
                choroSettings.vectorProperty = ChoroplethSettings.PREDEFINED_VECTOR_PROPERTY;
            }
        }
    }
}
