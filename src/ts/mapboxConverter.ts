module powerbi.extensibility.visual {
    export module mapboxConverter {
        const convertToFeatures = (rows, columns) => {
            return rows.map( (row, rowIndex) => {
                let ret: GeoJSON.Feature<any> = {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        // Use null coordinate values if no long/lats are defined.
                        // Useful for location visualizations
                        coordinates: [null, null]
                    },
                    id: rowIndex,
                    properties: {
                    }
                }
                row.map( (value, index) => {
                    const column = columns[index];
                    if (column.roles.longitude && value >= -180 && value <= 180) {
                        ret.geometry.coordinates[0] = value;
                    }
                    if (column.roles.latitude && value >= -90 && value <= 90) {
                        ret.geometry.coordinates[1] = value;
                    }
                    ret.properties[column.displayName] = value;
                })
                return ret;
            })
        }

        export function convert(dataView: DataView) {
            const { rows } = dataView.table;
            const { columns } = dataView.metadata;
            return convertToFeatures(rows, columns);
        }
    }
}
