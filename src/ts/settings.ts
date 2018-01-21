module powerbi.extensibility.visual {
    import DataViewObjectsParser = powerbi.extensibility.utils.dataview.DataViewObjectsParser;
    declare var mapbox : any;
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
                let settings : MapboxSettings = <MapboxSettings>dataViewObjectParser;
                let instanceEnumeration = DataViewObjectsParser.enumerateObjectInstances(dataViewObjectParser, options);

                switch (options.objectName) {
                    case 'api': {
                        return settings.api.enumerateObjectInstances(instanceEnumeration);
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
        public radius: number = 5.0;
        public scaleFactor: number = 2.0;
        public minColor: string = "#ffffcc";
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
        public radius: number = 20;
        public weight: number = 1;
        public intensity: number = 1;
        public opacity: number = 100;
        public color: string = "red";
        public minZoom: number = 0;
        public maxZoom: number = 22;
    }

    export class ClusterSettings {
        public show: boolean = false;
        public aggregation: string = "count";
        public clusterRadius: number = 30;
        public clusterMaxZoom: number = 20;
        public minColor: string = "#ffffcc";
        public maxColor: string = "#253494";
        public radius: number = 10;
        public strokeWidth: number = 1;
        public strokeColor: string = "black";
        public strokeOpacity: number = 50;
        public minZoom: number = 0;
        public maxZoom: number = 22;
    }

    export class ChoroplethSettings {
        public show: boolean = false;
        public vectorTileUrl: string = 'mapbox://'
        public sourceLayer: string = '';
        public vectorProperty: string = '';
        public minColor: string = "red";
        public maxColor: string = "green";
        public minZoom: number = 0;
        public maxZoom: number = 22;

        public display(): boolean {
            return this.show &&
                this.vectorProperty != "" &&
                this.sourceLayer != "" &&
                this.vectorTileUrl != ""
        }
    }
}
