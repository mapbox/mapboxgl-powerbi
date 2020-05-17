import powerbiVisualsApi from "powerbi-visuals-api";
import DataView = powerbiVisualsApi.DataView;
import IVisualHost = powerbiVisualsApi.extensibility.visual.IVisualHost;
import { dataViewObject, dataViewObjects } from "powerbi-visuals-utils-dataviewutils"

import { shouldUseGradient } from "./mapboxUtils"

export class Palette {
    private mapVisual: any; // TODO
    private dataColorGroupNames: string[];
    private colorMap: { [group: string]: string };
    private colorPalette: powerbiVisualsApi.extensibility.IColorPalette;

    constructor(mapVisual: any, host: IVisualHost) { // TODO
        this.mapVisual = mapVisual
        this.colorPalette = host.colorPalette
        this.dataColorGroupNames = []
        this.colorMap = {
        }
    }

    public getColor(id: string | number): string {
        const idStr = id.toString()
        if (!this.colorMap[idStr]) {
            this.colorMap[idStr] = this.colorPalette.getColor(idStr).value
        }

        return this.colorMap[idStr];
    }

    public enumerateObjectInstances(options: powerbiVisualsApi.EnumerateVisualObjectInstancesOptions) {
        const objectEnumeration: powerbiVisualsApi.VisualObjectInstance[] = this.dataColorGroupNames.map(name => {
            return {
                objectName: options.objectName,
                displayName: name,
                properties: {
                    fill: {
                        solid: {
                            color: this.getColor(name)
                        }
                    }
                },
                // Creates options under metadata.objects.colorSelector.$instances
                selector: {
                    id: name,
                },
            };
        });
        return objectEnumeration;
    }

    public update(dataView: DataView, features: any) {
        try {
            this.dataColorGroupNames = [];
            const roleMap = this.mapVisual.getRoleMap()

            const colors = roleMap.getAll('color');
            colors.map(colorCol => {
                if (!colorCol) {
                    return;
                }

                if (shouldUseGradient(colorCol)) {
                    return;
                }

                const colorPropertyName = colorCol.displayName;

                this.updateDataColorGroupNames(features, colorPropertyName);
            })
            this.updateColorMap(dataView);
        }
        catch (err) {
            console.log("Exception occured during group color creation: ", err);
        }
    }

    private updateDataColorGroupNames(features: any, colorPropertyName: string) {
        const uniqueGroupNames: { [name: string]: boolean; } = {};
        features.forEach(feature => {
            const groupName = feature.properties[colorPropertyName];
            uniqueGroupNames[groupName] = true;
        });
        this.dataColorGroupNames = [...this.dataColorGroupNames, ...Object.keys(uniqueGroupNames)];
    }

    updateColorMap(dataView: DataView) {
        const colorSelector = dataView && dataView.metadata && dataView.metadata.objects ?
            dataViewObjects.getObject(dataView.metadata.objects, "colorSelector")
            :
            null;

        this.dataColorGroupNames.forEach(name => {
            let colorValue = this.getColor(name)
            if (colorSelector && colorSelector.$instances) {
                colorValue = dataViewObject.getFillColorByPropertyName(colorSelector.$instances[name], "fill", colorValue);
            }

            this.colorMap[name] = colorValue
        })
    }
}
