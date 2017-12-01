module powerbi.extensibility.visual {
    import DataViewObjectsParser = powerbi.extensibility.utils.dataview.DataViewObjectsParser;

    export interface MapboxData {
        features: any[];
        maxSize: number;
    }

    export class MapboxSettings extends DataViewObjectsParser {
        public api: APISettings = new APISettings();
        public heatmap: HeatmapSettings = new HeatmapSettings();
    }

    export class APISettings {
        public accessToken: string = "";
        public style: string = "";
        public style_url: string = "";
        public layerType: string = "circle";
        public aggregation: string = "count";
    }

    export class HeatmapSettings {
        public radius: number = 30;
        public weight: number = 1;
        public intensity: number = 1;
        public opacity: number = 100;
        public color: string = "red";
    }
}
