module powerbi.extensibility.visual {

    interface GroupColor {
        name: string,
        selectionId: any, // ISelectionId,
        color: string;
    }

    export class Palette {
        private mapVisual: MapboxMap;
        private groupColors: GroupColor[];
        private colorMap: any;
        private host: IVisualHost;
        private colorPalette: IColorPalette;

        constructor(mapVisual: MapboxMap, host: IVisualHost) {
            this.mapVisual = mapVisual
            this.host = host
            this.colorPalette = host.colorPalette
            this.groupColors = []
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
            for (let group of this.groupColors) {
                objectEnumeration.push({
                    objectName: options.objectName,
                    displayName: group.name,
                    properties: {
                        fill: {
                            solid: {
                                color: group.color
                            }
                        }
                    },
                    selector: group.selectionId.getSelector(),
                });
            }
            return objectEnumeration;
        }

        public update(dataView: DataView, features: any) {
            try {
                this.groupColors = [];
                const roleMap = this.mapVisual.getRoleMap()
                if (mapboxUtils.shouldUseGradient(roleMap.color)) {
                    return;
                }

                const cat = dataView.categorical.categories[0];

                let groups = {};
                features.map(feature => {
                    const name = feature.properties[roleMap.color.displayName];
                    if (!groups[name]) {
                        groups[name] = true;
                    }
                });
                this.groupColors = this.createGroupColors(groups, cat);
            }
            catch (err) {
                console.log("Exception occured during group color creation: ", err);
            }
        }

        createGroupColors(groups, cat) {
            return Object.keys(groups).map( (group, i) => {
                const pbicolor = this.getColor(i.toString()).value
                const color = this.colorMap[group] ? this.colorMap[group] : pbicolor

                let defaultColor: Fill = {
                    solid: {
                        color
                    }
                }

                const colorValue = mapboxUtils.getCategoricalObjectValue<Fill>(cat, i, 'colorSelector', 'fill', defaultColor).solid.color
                this.colorMap[group] = colorValue

                return {
                    name: group,
                    color: colorValue,
                    selectionId: this.host.createSelectionIdBuilder()
                        .withCategory(cat, i)
                        .createSelectionId()
                }
            })
        }
    }
}
