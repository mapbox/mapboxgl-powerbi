import { getRandomNumbers, testDataViewBuilder } from "powerbi-visuals-utils-testutils"
import powerbiVisualsApi from "powerbi-visuals-api"
import { valueType } from "powerbi-visuals-utils-typeutils"
import TestDataViewBuilder = testDataViewBuilder.TestDataViewBuilder
import DataView = powerbiVisualsApi.DataView
import ValueType = valueType.ValueType

export class MapboxData extends TestDataViewBuilder {
    private rowCount: number = 5;

    public categoryValues: string[] = [
        "Alabama",
        "Missouri",
        "Minnesota",
        "Kansas",
        "California",
    ];

    private getValues(min: number, max: number): number[] {
        return getRandomNumbers(this.rowCount, min, max)
    }


    getDataView(columnNames?: string[]): DataView {
        return this.createCategoricalDataViewBuilder([
            {
                source: {
                    displayName: 'Category',
                    type: ValueType.fromDescriptor({ text: true }),
                    roles: { category: true }
                },
                values: this.categoryValues
            }
        ], [
            {
                source: {
                    displayName: 'Latitude',
                    type: ValueType.fromDescriptor({ numeric: true }),
                    roles: { latitude: true }
                },
                values: this.getValues(-90, 90)
            },
            {
                source: {
                    displayName: 'Longitude',
                    type: ValueType.fromDescriptor({ numeric: true }),
                    roles: { longitude: true }
                },
                values: this.getValues(-180, 180)
            },
            {
                source: {
                    displayName: 'Location',
                    type: ValueType.fromDescriptor({ text: true }),
                    roles: { location: true }
                },
                values: this.categoryValues
            },
            {
                source: {
                    displayName: 'Color',
                    type: ValueType.fromDescriptor({ text: true }),
                    roles: { color: true }
                },
                values: this.getValues(0, 10000)
            },
            {
                source: {
                    displayName: 'Cluster',
                    type: ValueType.fromDescriptor({ text: true }),
                    roles: { cluster: true }
                },
                values: this.getValues(0, 10000)
            },
        ], columnNames).build();
    }
}
