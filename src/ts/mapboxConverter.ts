module powerbi.extensibility.visual {
    export module mapboxConverter {
        const convertToFeatures = (rows, columns) => {
            return rows.map( (row, rowIndex) => {
                let ret: GeoJSON.Feature<any> = {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: []
                    },
                    properties: {
                    }
                }
                row.map( (value, index) => {
                    const column = columns[index];
                    if (column.roles.latitude && value >= -90 && value <= 90) {
                        ret.geometry.coordinates[1] = value;
                    }
                    if (column.roles.longitude && value >= -180 && value <= 180) {
                        ret.geometry.coordinates[0] = value;
                    }
                    ret.properties[column.displayName] = value;
                })
                return ret;
            }).map( feature => {
                if (feature.geometry.coordinates.length < 2) {
                    delete feature.geometry;
                }
                return feature;
            });
        }

        export function convert(dataView: DataView) {
            const {columns, rows} = dataView.table;
            return convertToFeatures(rows, columns);
        }
    }
}
