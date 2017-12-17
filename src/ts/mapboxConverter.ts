module powerbi.extensibility.visual {
    export module mapboxConverter {

        const positionInArray = (array, element) => { 
            return array.findIndex( value => {
                return value === element
            })
        } 

        const pushIfNotExist = (array, element) => {
            if (positionInArray(array, element) === -1) {
                array.push(element)
            }
        }

        const transformToObjectArray = (rows, columns) => {
            let domain : any = [];

            const datas = rows.map( row => {
                return row.reduce( (obj, value, index) => {
                    const column = columns[index]
                    const role = Object.keys(column.roles)[0]
                    obj[role] = value;
                    if (column.roles.category) {
                        const t = column.type.primitiveType;
                        pushIfNotExist(domain, value);
                        if (typeof value != 'number') {
                            const colorIndex = positionInArray(domain, value);
                            obj.color = colorIndex < 8 ? colorIndex + 1 : 9;
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

        const getScale = (domain) => {
            if (!domain || !(domain.length > 0)) {
                return null;
            }
            let length = domain.length
            if (typeof domain[0] === 'number') {
                var limits = chroma.limits(domain, 'q', length);
                return chroma.scale('YlGnBu').domain(limits)
            } else {
                return chroma.scale('Set2').domain([1, length + 1])
            }
        }

        const getFeatures = (datas, domain, tooltipColumns) => {
            let features = []
            const scale = getScale(domain);
            features = datas.map(function (d) {
                let tooltip = tooltipColumns.map( tooltipColumn => {
                    return `${tooltipColumn.displayName}: ${d[tooltipColumn.propertyName]}`;
                })
                //let tooltip = d.category || d.size;
                let properties = {
                    "colorValue": d.color,
                    "color": null,
                    "tooltip": tooltip.join(','),
                    "size": d.size,
                    "location": d.location
                }
                if (scale && d.color) {
                    properties.color = scale(d.color).toString();
                }

                if ( (d.latitude >= -90) && (d.latitude <= 90) && (d.longitude >= -180) && (d.longitude <= 180) ) {
                    let feat: GeoJSON.Feature<any> = {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [d.longitude, d.latitude]
                        },
                        properties
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
