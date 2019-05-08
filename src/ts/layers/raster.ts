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

        addWeatherLayers(settings) {
            const map = this.parent.getMap();
            var adding = 0
            // console.log('calling addWeatherLayer')
            // console.log('settings.raster.weather', settings.raster.weather)
            console.log('check if weather layer exists', !map.getLayer('weather'))
            console.log('adding', adding)
            if (settings.raster.weather && !map.getLayer('weather')) {

                const self = this
                axios.get("https://api.weather.com/v3/TileServer/series/productSet/PPAcore?apiKey=3f8ed76d96d94f1f8ed76d96d98f1fc0")
                    .then(function (response) {
                        if (!map.getLayer('weather')) {
                            self.timeSlice = response.data.seriesInfo['radar'].series[0].ts
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
                        }

                    })

            }
            else if (map.getLayer('weather') && !settings.raster.weather) {
                console.log('removing weather layer else')
                this.removeWeatherLayers()
            }


        }

        addCustomLayer(settings) {
            const map = this.parent.getMap();

            if (settings.raster.custom && !map.getLayer('raster')) {
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
            else if (map.getLayer('raster') && !settings.raster.custom) {
                console.log('removing weather layer else')
                this.removeCustomLayer()
            }
            

        }

        removeCustomLayer() {
            console.log('removing custom layer')
            const map = this.parent.getMap();
            map.removeLayer('raster')
            map.removeSource('raster')
        }

        removeWeatherLayers() {
            // console.log('removing weather layer')
            const map = this.parent.getMap();
            map.removeLayer('weather')
            map.removeSource('weather')
        }


        addLayer(settings, beforeLayerId) {

            this.addWeatherLayers(settings)
            this.addCustomLayer(settings)


        }

        removeLayer() {
            const map = this.parent.getMap();
            map.removeLayer('raster');


            console.log('SOURCE', this.source)
            this.source.removeFromMap(map, 'raster');
        }

        applySettings(settings, roleMap) {
            this.addWeatherLayers(settings)
            this.addCustomLayer(settings)
            console.log('settings applied')
            super.applySettings(settings, roleMap);
            const map = this.parent.getMap();
            if (settings.raster.custom) {
                map.setPaintProperty(Raster.ID, 'raster-opacity', settings.raster.opacity / 100);
                map.setLayerZoomRange(Raster.ID, settings.raster.minZoom, settings.raster.maxZoom);
            }
        }

    }

}

