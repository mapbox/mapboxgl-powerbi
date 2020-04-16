import { Point } from "./point"
import { Raster } from "./raster"
import { Cluster } from "./cluster"
import { Choropleth } from "./choropleth"

export const Sources = {
    Point: new Point(),
    Raster: new Raster(),
    Cluster: new Cluster(),
    Choropleth: new Choropleth()        
}
