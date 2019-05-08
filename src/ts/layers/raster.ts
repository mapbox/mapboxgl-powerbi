module powerbi.extensibility.visual {
    declare var turf: any;
    declare var axios: any;

    export class Raster extends Layer {
        private static readonly ID = 'raster';
        private static LayerOrder = [Raster.ID]
        private timeSlice: string;

        constructor(map: MapboxMap) {
            super(map)
            this.id = 'raster'
            this.source = data.Sources.Raster
            console.log('INTIALIZING')


            // const self = this
            // axios.get("https://api.weather.com/v3/TileServer/series/productSet/PPAcore?apiKey=3f8ed76d96d94f1f8ed76d96d98f1fc0")
            //     .then(function (response) {
            //         console.log('layer response')
            //         console.log(response.data.seriesInfo['radar'].series[0])
            //         self.timeSlice = response.data.seriesInfo['radar'].series[0].ts
            //         console.log('TIMESLICE', self.timeSlice)
            //     })
        }



        getLayerIDs() {
            return [Raster.ID];
        }

        addWeatherLayers(settings, beforeLayerId) {
            const map = this.parent.getMap();
            console.log('calling addWeatherLayer')
            console.log('settings.raster.weather', settings.raster.weather)
            if(settings.raster.weather) {
                const self = this
                axios.get("https://api.weather.com/v3/TileServer/series/productSet/PPAcore?apiKey=3f8ed76d96d94f1f8ed76d96d98f1fc0")
                    .then(function (response) {
                        console.log('layer response')
                        console.log(response.data.seriesInfo['radar'].series[0])
                        self.timeSlice = response.data.seriesInfo['radar'].series[0].ts
                        console.log('TIMESLICE', self.timeSlice)
                        console.log("ADDING LAYER IN ADD WEATHER LAYERS")

                        
                        map.addLayer({
                            id: 'weather',
                            source: {
                                'type': 'raster',
                                'tiles': [
                                    "https://api.weather.com/v3/TileServer/tile/radar?ts=" + "1557335400" + "&xyz={x}:{y}:{z}&apiKey=3f8ed76d96d94f1f8ed76d96d98f1fc0"
                                ],
                                'tileSize': 256
                            },
                            type: 'raster',
                            paint: {
            
                            }
                        })
                    })
            }
            else if (map.getLayer('weather')) {
                console.log('removing weather layer else')
                this.removeWeatherLayers()
            }
            

        }

        removeWeatherLayers() {
            console.log('removing weather layer')
            const map = this.parent.getMap();
            map.removeLayer('weather')
            map.removeSource('weather')
        }


        addLayer(settings, beforeLayerId) {
            const map = this.parent.getMap();
            const layers = {};

            layers[Raster.ID] = mapboxUtils.decorateLayer({
                id: Raster.ID,
                source: 'raster',
                type: 'raster',
                paint: {
                    'raster-opacity': 1
                }
            });

            Raster.LayerOrder.forEach(function (layerId) {
                console.log('layer id', layerId)
                map.addLayer(layers[layerId])
            })

        }

        removeLayer() {
            const map = this.parent.getMap();
            map.removeLayer('raster');


            console.log('SOURCE', this.source)
            this.source.removeFromMap(map, 'raster');
        }

        applySettings(settings, roleMap) {
            console.log('settings applied')
            super.applySettings(settings, roleMap);
            const map = this.parent.getMap();
            console.log('settings applied')
            console.log(settings.raster.weather.show)
            if (settings.raster.show) {
                map.setPaintProperty(Raster.ID, 'raster-opacity', settings.raster.opacity / 100);
                map.setLayerZoomRange(Raster.ID, settings.raster.minZoom, settings.raster.maxZoom);
            }
        }

    }

}

