module powerbi.extensibility.visual {
    export module mapboxConverter {
        const transformToObjectArray = (rows, columns) => {
            let domain : any = [];

            const datas = rows.map( row => {
                return row.reduce( (obj, value, index) => {
                    const column = columns[index]
                    const role = Object.keys(column.roles)[0]
                    obj[role] = value;
                    if (column.roles.color) {
                        const t = column.type.primitiveType;
                        mapboxUtils.pushIfNotExist(domain, value);
                        if (typeof value != 'number') {
                            const colorIndex = mapboxUtils.positionInArray(domain, value);
                            obj.color = mapboxUtils.getColorFromIndex(colorIndex);
                        } else {
                            obj.color = value;
                        }
                    }
                    return obj;
                }, {});
            });
            return {
                datas,
                domain,
            }
        }

        const getFeatures = (datas, domain, tooltipColumns) => {
            let features = []
            features = datas.map(function (d) {
                let tooltip = tooltipColumns.map( tooltipColumn => {
                    return `${tooltipColumn.displayName}: ${d[tooltipColumn.propertyName]}`;
                })
                let properties = {
                    "colorValue": d.color,
                    "tooltip": tooltip.join(','),
                    "sizeValue": d.size,
                    "location": d.location,
                    "clusterValue": d.cluster
                }

                if ( (d.latitude >= -90) && (d.latitude <= 90) && (d.longitude >= -180) && (d.longitude <= 180) ) {
                    let feat: GeoJSON.Feature<any> = {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [d.longitude, d.latitude]
                        },
                        "properties": properties
                    }
                    return feat;
                } else if (d.location) {
                    let feat = { properties }
                    return feat;
                }
            });

            return features;
        }

        export function convert(dataView: DataView, host: IVisualHost) {

            const {columns, rows} = dataView.table;

            const tooltipColumns = mapboxUtils.getTooltipColumns(columns);

            // Convert each row from value array to a JS object like { latitude: "", longitude: "" ... }
            const { datas, domain }  = transformToObjectArray(rows, columns);

            return getFeatures(datas, domain, tooltipColumns)
        }
    }
}
