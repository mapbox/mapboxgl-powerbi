module powerbi.extensibility.visual {
    declare var turf: any;
    declare var axios: any;

    export class Raster extends Layer {
        private static readonly ID = 'raster';
        private static readonly LayerOrder = [Raster.ID, 'weather']
        private timeSlice: string;

        constructor(map: MapboxMap) {
            super(map)
            this.id = 'raster'
            this.source = data.Sources.Raster
            console.log('intializing')
            
            
            const self = this
            axios.get("https://api.weather.com/v3/TileServer/series/productSet/PPAcore?apiKey=3f8ed76d96d94f1f8ed76d96d98f1fc0")
            .then(function (response) {
                console.log('layer response')
                console.log(response.data.seriesInfo['radar'].series[0])
                self.timeSlice = response.data.seriesInfo['radar'].series[0].ts
                console.log('TIMESLICE', self.timeSlice)
            })
        }

        getLayerIDs() {
            return [Raster.ID];
        }

        addLayer(settings, beforeLayerId) {
            console.log('ADDING LAYER', this.timeSlice)
            const map = this.parent.getMap();
            const layers = {};
            const weatherLayer = {
                id: 'weather',
                source: {
                    'type': 'raster',
                    'tiles': [
                        "https://api.weather.com/v3/TileServer/tile/radar?ts=" +  this.timeSlice + "&xyz={x}:{y}:{z}&apiKey=3f8ed76d96d94f1f8ed76d96d98f1fc0"
                    ],
                    'tileSize': 256
                },
                type: 'raster',
                paint: {

                }
            }
            layers[Raster.ID] = mapboxUtils.decorateLayer({
                id: Raster.ID,
                source: 'raster',
                type: 'raster',
                paint: {
                    'raster-opacity': 1
                }
            });
            console.log()
            layers['weather'] = weatherLayer
            
            console.log('layer order', Raster.LayerOrder)
            
            Raster.LayerOrder.forEach(function(layerId) {
                console.log('layer id', layerId)
                map.addLayer(layers[layerId], beforeLayerId)
            })

        }

        removeLayer() {
            const map = this.parent.getMap();
            map.removeLayer('raster');
            map.removeLayer('weather')
            console.log('SOURCE', this.source)
            this.source.removeFromMap(map, 'raster');
            // this.source2.removeFromMap(map, 'weather')
            // this.source.removeFromMap(map, 'weather');
        }

        applySettings(settings, roleMap) {
            super.applySettings(settings, roleMap);
            const map = this.parent.getMap();
            if (settings.raster.show) {
                map.setPaintProperty(Raster.ID, 'raster-opacity', settings.raster.opacity / 100);
                map.setLayerZoomRange(Raster.ID, settings.raster.minZoom, settings.raster.maxZoom);
            }
        }

    }

}

