module powerbi.extensibility.visual {
    export module mapboxConverter {
        const isTooltip = (role) => {
            return role == 'color' || role == 'size' || role == 'tooltips' || role == 'cluster';
        }

        const checkLngLatValid = (feat) => {
            return feat.longitude != undefined && feat.latitude != undefined &&
                feat.latitude >= -90 && feat.latitude <= 90 &&
                feat.longitude >= -180 && feat.longitude <= 180
        }

        const transformToObjectArray = (rows, columns) => {
            let domain : any = [];

            const datas = rows.map( row => {
                return row.reduce( (obj, value, index) => {
                    const column = columns[index]
                    Object.keys(column.roles).map( role => {
                        if (isTooltip(role)) {
                            if (!obj.tooltip) {
                                obj.tooltip = {}
                            }
                            obj.tooltip[column.displayName] = value;
                        }

                        if (role == 'cluster') {
                            obj.clusterField = column.displayName;
                        }

                        obj[role] = value;

                        if (role == 'color') {
                            const t = column.type.primitiveType;
                            mapboxUtils.pushIfNotExist(domain, value);
                            if (typeof value != 'number') {
                                const colorIndex = mapboxUtils.positionInArray(domain, value);
                                obj.color = mapboxUtils.getColorFromIndex(colorIndex);
                            } else {
                                obj.color = value;
                            }
                        }
                    })
                    return obj;
                }, {});
            });
            return {
                datas,
                domain,
            }
        }

        const getFeatures = (rows, columns) => {
            const { datas, domain }  = transformToObjectArray(rows, columns);

            return datas.map(d => {

                let properties : any = {
                    "colorValue": d.color,
                    "tooltip": JSON.stringify({
                        clusterField: d.clusterField,
                        content: d.tooltip
                    }),
                    "sizeValue": d.size,
                    "location": d.location,
                    "clusterValue": d.cluster
                }

                // Return geojson feature
                let feat: GeoJSON.Feature<any> = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        // Use null coordinate values if no long/lats are defined.
                        // Useful for location visualizations
                        "coordinates": [checkLngLatValid(d) ? d.longitude : null, 
                                        checkLngLatValid(d) ? d.latitude : null]
                    },
                    "properties": properties
                }
                return feat;
                
            });
        }

        export function convert(dataView: DataView, host: IVisualHost) {

            const {columns, rows} = dataView.table;
            return getFeatures(rows, columns)
        }
    }
}
