module powerbi.extensibility.visual {
    export module mapboxConverter {
        const isTooltip = (role) => {
            return role == 'color' || role == 'size' || role == 'tooltips' || role == 'cluster';
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

            let features = []
            features = datas.map(function (d) {
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
            return getFeatures(rows, columns)
        }
    }
}
