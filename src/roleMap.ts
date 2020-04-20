import powerbiVisualsApi from "powerbi-visuals-api";

export class RoleMap {
    map: any;

    constructor(metadata: powerbiVisualsApi.DataViewMetadata) {
        this.map = getRoleMap(metadata)
    }

    cluster() : string{
        const col = this.getColumn('cluster');
        return col ? col.displayName : "";
    }

    color() : string{
        const col = this.getColumn('color');
        return col ? col.displayName : "";
    }

    location() : string {
        const col = this.getColumn('location');
        return col ? col.displayName : "";
    }

    size() : string {
        const col = this.getColumn('size');
        return col ? col.displayName : "";
    }

    latitude() : string {
        const col = this.getColumn('latitude');
        return col ? col.displayName : "";
    }

    longitude() : string {
        const col = this.getColumn('longitude');
        return col ? col.displayName : "";
    }

    getColumn(role: string) : powerbiVisualsApi.DataViewMetadataColumn {
        if (!this.map[role] || this.map[role].length <= 0) {
            return null;
        }
        return this.map[role][0];
    }
}

//
// TODO: tests
function getRoleMap(metadata: powerbiVisualsApi.DataViewMetadata) {
    //const ret = {
        //tooltips: {}
    //}
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
    console.log("Built rolemap. From: ", metadata);
    console.log("Built rolemap. To: ", ret);
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

