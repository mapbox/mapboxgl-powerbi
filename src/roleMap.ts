import powerbiVisualsApi from "powerbi-visuals-api";
import { Layer } from "./layers/layer"
import { Cluster } from "./layers/cluster"
import { Choropleth } from "./layers/choropleth"

export interface Column extends powerbiVisualsApi.DataViewMetadataColumn {
    /** The index of the column under the property  that this column provides to the visualization. */
    rolesIndex?: { [name: string]: number };
}

export class RoleMap {
    map: any;
    columns: Column[];

    constructor(metadata: powerbiVisualsApi.DataViewMetadata) {
        this.map = getRoleMap(metadata)
        this.columns = metadata.columns;
    }

    cluster() : string{
        const col = this.getColumn('cluster', Cluster.ID);
        return col ? col.displayName : "";
    }

    color(layer : Layer) : string{
        const col = this.getColumn('color', layer.id);
        return col ? col.displayName : "";
    }

    location() : string {
        const col = this.getColumn('location', Choropleth.ID);
        return col ? col.displayName : "";
    }

    size() : string {
        const col = this.getColumn('size', 'circle'); // TODO
        return col ? col.displayName : "";
    }

    latitude() : string {
        const col = this.getColumn('latitude', 'circle'); // TODO
        return col ? col.displayName : "";
    }

    longitude() : string {
        const col = this.getColumn('longitude', 'circle'); // TODO
        return col ? col.displayName : "";
    }

    tooltips() : any[] {
        return this.map['tooltips'];
    }

    getAll(role: string) : Column[] {
        if (!this.map[role] || this.map[role].length <= 0) {
            return null;
        }

        return this.map[role]
    }

    getColumn(role: string, layerID: string) : Column {
        if (!this.map[role] || this.map[role].length <= 0) {
            return null;
        }

        if (layerID === Choropleth.ID && this.map[role].length > 1) {
            return this.map[role][1];
        }

        return this.map[role][0];
    }
}

//
// TODO: tests
function getRoleMap(metadata: powerbiVisualsApi.DataViewMetadata) {
    let ret = {}
    metadata.columns.map(column => {
        Object.keys(column.roles).map(role => {
            if (!ret[role]) {
                ret[role] = []
            }

            ret[role].push(column)
            return ret
        })
    });
    Object.keys(ret).map( key => {
        ret[key] = ret[key].sort( (a, b) => {
            return a.rolesIndex[key] - b.rolesIndex[key];
        });
    });
    return ret;
}

// TODO: possibility to give back not only the first one
//export function getColumn(roleMap, role) {
    //if (!roleMap[role] || roleMap[role].length <= 0) {
        //return null;
    //}
//
    //return roleMap[role][0];
//}

