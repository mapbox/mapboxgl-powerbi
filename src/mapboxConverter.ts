import powerbiVisualsApi from "powerbi-visuals-api";
import DataView = powerbiVisualsApi.DataView;
import { RoleMap } from "./roleMap"

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

    const transformCategory = (category) => {
       return category.values.map( value => {
           return {
               [category.source.displayName]: value
           }
            //return Object.keys(category.source.roles).reduce( (acc, role) => {
                //acc[role] = value
                //return acc
            //}, {})
        })
    }

    const convertCategoricalToFeatures = (categorical, roleMap) => {
        if (!categorical.categories || !categorical.categories.length) {
            return []
        }

        const categories = categorical.categories.length > 0 ? categorical.categories.map(transformCategory) : []
        const values = categorical.values && categorical.values.length > 0 ? categorical.values.map(transformCategory) : []
        const ret = [...categories, ...values]
        if (ret.length > 0) {
            const reduced = ret[0].map( (value, index) => {
                return ret.reduce( (acc, column) => {
                    return {...acc, ...column[index]}
                }, {})
            })

            return reduced.map( (prop, index) => {
                return {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [prop[roleMap.longitude()] || null, prop[roleMap.latitude()] || null]
                    },
                    id: index,
                    properties: prop
                }
            });
        }
        return []
    }

    export function convert(dataView: DataView, roleMap: RoleMap) {
        const { columns } = dataView.metadata;
        const features = convertCategoricalToFeatures(dataView.categorical, roleMap)
        return features;
    }
}
