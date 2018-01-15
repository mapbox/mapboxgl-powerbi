/// <reference path="_references.ts"/>

module powerbi.extensibility.visual.test {
    import getRandomNumbers = powerbi.extensibility.utils.test.helpers.getRandomNumbers;
    import TestDataViewBuilder = powerbi.extensibility.utils.test.dataViewBuilder.TestDataViewBuilder;

    export class MapboxData extends TestDataViewBuilder {
        // public static ColumnCategory: string = "Country";
        public static ColumnCategory: string = "Color";
        public static LatituceValues: string = "Latitude";
        public static LongitudeValues: string = "Longitude";

        public valuesCategory: string[] = [
            "Alabama",
            "Missouri",
            "Minnesota",
            "Kansas",
            "California",
        ];

        public latitudeValues: number[] = getRandomNumbers(
            this.valuesCategory.length,
            -90,
            90);

        public longitudeValues: number[] = getRandomNumbers(
            this.valuesCategory.length,
            -180,
            180);

        public getDataView(columnNames?: string[]): DataView {
            return this.createCategoricalDataViewBuilder([
                {
                    source: {
                        displayName: MapboxData.ColumnCategory,
                        type: ValueType.fromDescriptor({ text: true }),
                        roles: {category: true}
                    },
                    values: this.valuesCategory
                }
            ], [
                    {
                        source: {
                            displayName: MapboxData.LatitudeValues,
                            type: ValueType.fromDescriptor({ numeric: true }),
                            roles: {latitude: true}
                        },
                        values: this.latitudeValues
                    },
                    {
                        source: {
                            displayName: MapboxData.LongitudeValues,
                            type: ValueType.fromDescriptor({ numeric: true }),
                            roles: {longitude: true}
                        },
                        values: this.longitudeValues
                    },
                    {
                        source: {
                            displayName: MapboxData.LocationValues,
                            type: ValueType.fromDescriptor({ text: true }),
                            roles: {location: true}
                        }
                        values: this.valuesCategory
                    },
                ], columnNames).build();
        }
    }
}
