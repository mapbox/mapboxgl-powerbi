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
        public style: string = "mapbox:\/\/styles\/mapbox\/light-v9?optimize=true";
        public styleUrl: string = "";
        public zoom: number = 0;
        public startLong: number = 0;
        public startLat: number = 0;
        public autozoom: boolean = true;
        public apiUrl: string = "https://api.mapbox.com"
        public showControls: boolean = true;

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
        public highlightColor: string = "#253494";
        public blur: number = 0.0;
        public opacity: number = 80;
        public strokeWidth: number = 1;
        public strokeColor: string = "#bdbdbd";
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
        public highlightColor: string = "#2c7fb8";
        public minZoom: number = 0;
        public maxZoom: number = 22;

        public maxLevel: number = 1
        public selectedLevel: string = '1'
        public currentLevel: number = 1;

        public data1: string = ChoroplethSettings.US_STATES_TILE_URL;  // Let US states be the default
        public vectorTileUrl1: string = ChoroplethSettings.GLOBAL_COUNTRIES_TILE_URL;
        public sourceLayer1: string = ChoroplethSettings.GLOBAL_COUNTRIES_SOURCE_LAYER;
        public vectorProperty1: string = ChoroplethSettings.PREDEFINED_VECTOR_PROPERTY;

        public data2: string = ChoroplethSettings.US_STATES_TILE_URL;  // Let US states be the default
        public vectorTileUrl2: string = ChoroplethSettings.GLOBAL_COUNTRIES_TILE_URL;
        public sourceLayer2: string = ChoroplethSettings.GLOBAL_COUNTRIES_SOURCE_LAYER;
        public vectorProperty2: string = ChoroplethSettings.PREDEFINED_VECTOR_PROPERTY;

        public data3: string = ChoroplethSettings.US_STATES_TILE_URL;  // Let US states be the default
        public vectorTileUrl3: string = ChoroplethSettings.GLOBAL_COUNTRIES_TILE_URL;
        public sourceLayer3: string = ChoroplethSettings.GLOBAL_COUNTRIES_SOURCE_LAYER;
        public vectorProperty3: string = ChoroplethSettings.PREDEFINED_VECTOR_PROPERTY;

        public data4: string = ChoroplethSettings.US_STATES_TILE_URL;  // Let US states be the default
        public vectorTileUrl4: string = ChoroplethSettings.GLOBAL_COUNTRIES_TILE_URL;
        public sourceLayer4: string = ChoroplethSettings.GLOBAL_COUNTRIES_SOURCE_LAYER;
        public vectorProperty4: string = ChoroplethSettings.PREDEFINED_VECTOR_PROPERTY;

        public data5: string = ChoroplethSettings.US_STATES_TILE_URL;  // Let US states be the default
        public vectorTileUrl5: string = ChoroplethSettings.GLOBAL_COUNTRIES_TILE_URL;
        public sourceLayer5: string = ChoroplethSettings.GLOBAL_COUNTRIES_SOURCE_LAYER;
        public vectorProperty5: string = ChoroplethSettings.PREDEFINED_VECTOR_PROPERTY;

        public data6: string = ChoroplethSettings.US_STATES_TILE_URL;  // Let US states be the default
        public vectorTileUrl6: string = ChoroplethSettings.GLOBAL_COUNTRIES_TILE_URL;
        public sourceLayer6: string = ChoroplethSettings.GLOBAL_COUNTRIES_SOURCE_LAYER;
        public vectorProperty6: string = ChoroplethSettings.PREDEFINED_VECTOR_PROPERTY;

        public data7: string = ChoroplethSettings.US_STATES_TILE_URL;  // Let US states be the default
        public vectorTileUrl7: string = ChoroplethSettings.GLOBAL_COUNTRIES_TILE_URL;
        public sourceLayer7: string = ChoroplethSettings.GLOBAL_COUNTRIES_SOURCE_LAYER;
        public vectorProperty7: string = ChoroplethSettings.PREDEFINED_VECTOR_PROPERTY;

        public data8: string = ChoroplethSettings.US_STATES_TILE_URL;  // Let US states be the default
        public vectorTileUrl8: string = ChoroplethSettings.GLOBAL_COUNTRIES_TILE_URL;
        public sourceLayer8: string = ChoroplethSettings.GLOBAL_COUNTRIES_SOURCE_LAYER;
        public vectorProperty8: string = ChoroplethSettings.PREDEFINED_VECTOR_PROPERTY;

        public data9: string = ChoroplethSettings.US_STATES_TILE_URL;  // Let US states be the default
        public vectorTileUrl9: string = ChoroplethSettings.GLOBAL_COUNTRIES_TILE_URL;
        public sourceLayer9: string = ChoroplethSettings.GLOBAL_COUNTRIES_SOURCE_LAYER;
        public vectorProperty9: string = ChoroplethSettings.PREDEFINED_VECTOR_PROPERTY;

        public data10: string = ChoroplethSettings.US_STATES_TILE_URL;  // Let US states be the default
        public vectorTileUrl10: string = ChoroplethSettings.GLOBAL_COUNTRIES_TILE_URL;
        public sourceLayer10: string = ChoroplethSettings.GLOBAL_COUNTRIES_SOURCE_LAYER;
        public vectorProperty10: string = ChoroplethSettings.PREDEFINED_VECTOR_PROPERTY;

        public opacity: number = 80;
        public outlineColor: string = "#bdbdbd";
        public outlineWidth: number = 1;
        public outlineOpacity: number = 50;


        public display(): boolean {
            return this.show &&
                this.vectorProperty1 != "" &&
                this.sourceLayer1 != "" &&
                this.vectorTileUrl1 != ""
        }

        private removeCustom(properties, id) {
            delete properties[`vectorTileUrl${id}`];
            delete properties[`sourceLayer${id}`];
            delete properties[`vectorProperty${id}`];
        }

        public enumerateObjectInstances(objectEnumeration) {
            let instances = objectEnumeration.instances;
            let properties = instances[0].properties;

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
                },
                maxLevel: {
                    numberRange: {
                        min: 1,
                        max: 10,
                    }
                },
                selectedLevel: []
            }

            for (let i = 0; i < properties.maxLevel; i++) {
                instances[0].validValues.selectedLevel.push((i + 1).toString());
            }

            if (properties.selectedLevel >  properties.maxLevel) {
                properties.selectedLevel = properties.maxLevel;
            }

            for (let i = 0; i < 10; i++) {
                if (properties.selectedLevel != i + 1) {
                    delete properties[`data${i + 1}`];
                    this.removeCustom(properties, i + 1);
                } else {
                    if (properties[`data${i + 1}`] !== 'custom') {
                        this.removeCustom(properties, i + 1)
                    }
                }
            }

            return { instances };
        }

        public hasChanged(old) {
            if (!old || old.maxLevel != this.maxLevel) {
                return true;
            }

            if (old.currentLevel != this.currentLevel) {
                return true;
            }

            for (let i = 0; i < this.maxLevel; i++) {
                if (old[`vectorTileUrl${i + 1}`] != this[`vectorTileUrl${i + 1}`] ||
                    old[`sourceLayer${i + 1}`] != this[`sourceLayer${i + 1}`] ||
                    old[`vectorProperty${i + 1}`] != this[`vectorProperty${i + 1}`]) {
                        return true;
                }
            }
            return false;

        }

        public static fillPredefinedProperties(choroSettings) {
            for (let i = 0; i < choroSettings.maxLevel; i++) {
                if (choroSettings[`data${i + 1}`] !== 'custom') {
                    switch (choroSettings[`data${i + 1}`]) {
                        case ChoroplethSettings.GLOBAL_COUNTRIES_TILE_URL:
                            choroSettings[`sourceLayer${i + 1}`] = ChoroplethSettings.GLOBAL_COUNTRIES_SOURCE_LAYER;
                            break;
                        case ChoroplethSettings.US_STATES_TILE_URL:
                            choroSettings[`sourceLayer${i + 1}`] = ChoroplethSettings.US_STATES_SOURCE_LAYER;
                            break;
                        case ChoroplethSettings.US_POSTCODES_TILE_URL:
                            choroSettings[`sourceLayer${i + 1}`] = ChoroplethSettings.US_POSTCODES_SOURCE_LAYER;
                            break;
                    }

                    choroSettings[`vectorTileUrl${i + 1}`] = choroSettings[`data${i + 1}`];
                    choroSettings[`vectorProperty${i + 1}`] = ChoroplethSettings.PREDEFINED_VECTOR_PROPERTY;
                }
            }
        }
    }
}
