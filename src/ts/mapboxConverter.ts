module powerbi.extensibility.visual {
    export module mapboxConverter {
        const convertToFeatures = (rows, columns, identities, visualHost) => {
            return rows.map( (row, rowIndex) => {
                let ret: GeoJSON.Feature<any> = {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        // Use null coordinate values if no long/lats are defined.
                        // Useful for location visualizations
                        coordinates: [null, null]
                    },
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
                const selectionIdBuilder: visuals.ISelectionIdBuilder = visualHost.createSelectionIdBuilder();
                const identity = identities[rowIndex]
                const categoryColumn: DataViewCategoryColumn = {
                    source: {
                        displayName: null,
                        queryName: identity.key
                    },
                    values: null,
                    identity: [identity]
                };
                selectionIdBuilder.withCategory(categoryColumn, 0);
                ret.properties['selectionId'] = selectionIdBuilder.createSelectionId();
                return ret;
            })
        }

        export function convert(dataView: DataView, visualHost) {
            const { rows, identity } = dataView.table;
            const { columns } = dataView.metadata;
            return convertToFeatures(rows, columns, identity, visualHost);
        }
    }
}
