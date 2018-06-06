module powerbi.extensibility.visual {

    interface DataPoint {
        category: string,
        selectionId: any, // ISelectionId,
        color: string;
    }

    export class Palette {
        private mapVisual: MapboxMap;
        private dataPoints: DataPoint[];
        private colorMap: any;
        private host: IVisualHost;
        private colorPalette: IColorPalette;

        constructor(mapVisual: MapboxMap, host: IVisualHost) {
            this.mapVisual = mapVisual
            this.host = host
            this.colorPalette = host.colorPalette
            this.dataPoints = []
            this.colorMap = {
            }
        }

        public getColorMap() {
            return this.colorMap
        }

        public getColor(id: string): IColorInfo {
            return this.colorPalette.getColor(id);
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions) {
            let objectEnumeration: VisualObjectInstance[] = [];
            for (let point of this.dataPoints) {
                objectEnumeration.push({
                    objectName: options.objectName,
                    displayName: point.category,
                    properties: {
                        fill: {
                            solid: {
                                color: point.color
                            }
                        }
                    },
                    selector: point.selectionId.getSelector(),
                });
            }
            return objectEnumeration;
        }

        public update(dataView: DataView, features: any) {
            try {
                this.dataPoints = [];
                const cat = dataView.categorical.categories[0];
                let categories = {};
                features.map(feature => {
                    const roleMap = this.mapVisual.getRoleMap()
                    const value = feature.properties[roleMap.color.displayName];
                    if (!categories[value]) {
                        categories[value] = true;
                    }
                });
                console.log("Categories: ", categories);
                this.dataPoints = this.fillDataPointsOwn(categories, cat);
            }
            catch (err) {
                console.log("Error: ", err);
            }
        }

        fillDataPointsOwn(categories, cat) {
            let ret = [];
            Object.keys(categories).map( (category, i) => {
                let colorValue = 'black';
                let defaultColor: Fill = {
                    solid: {
                        color: 'black'
                    }
                }

                if (cat.objects && cat.objects.length > i && cat.objects[i]) {
                    colorValue = mapboxUtils.getCategoricalObjectValue<Fill>(cat, i, 'colorSelector', 'fill', defaultColor).solid.color;
                    // colorValue = cat.objects[i].colorSelector.fill['solid']['color'];
                    this.colorMap[category] = colorValue;
                }

                ret.push({
                    category: category,
                    value: this.colorMap[category],
                    color: colorValue,
                    selectionId: this.host.createSelectionIdBuilder()
                        .withCategory(cat, i)
                        .createSelectionId()
                });
            })
            return ret;
        }

    }
}
