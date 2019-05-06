module powerbi.extensibility.visual {
    declare var turf: any;
    declare var axios: any;

    export class Raster extends Layer {
        private static readonly ID = 'raster';
        private static readonly LayerOrder = [Raster.ID];
        private weatherLayers = ['radar']

        constructor(map: MapboxMap) {
            super(map)
            this.id = 'raster'
            this.source = data.Sources.Raster
        }

        getLayerIDs() {
            return [Raster.ID];
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
            Raster.LayerOrder.forEach((layerId) => map.addLayer(layers[layerId], beforeLayerId));

         

            console.log('getting here')

            axios.get("https://api.weather.com/v3/TileServer/series/productSet/PPAcore?apiKey=3f8ed76d96d94f1f8ed76d96d98f1fc0")
                .then(function(response) {
                    console.log(response.data)
                    const config = {
                        baseUrl: "https://api.weather.com/v3/TileServer/tile/",
                        timeSlices: "",
                        layers: {}
                    };
                         config.timeSlices = response.data.seriesInfo;

                    // Put together the layer data, then add them to the map
                    //   buildLayers();
                    //   addLayers();

                    const layer = 'radar'
                    console.log('layerINGGGG')
                    const timeSlice = config.timeSlices['radar'].series[0].ts;
                    config.layers['radar'] = {
                        name: layer,
                        source: layer + "Source",
                        url: config.baseUrl + layer + "?ts=" + timeSlice + "&xyz={x}:{y}:{z}&apiKey=" + "3f8ed76d96d94f1f8ed76d96d98f1fc0"
                    };

                    const lyr = config.layers[layer];
                    console.log("LAYER", lyr.source)
                    map.addSource(lyr.source, {
                        type: "raster",
                        tiles: [lyr.url],
                        tileSize: 256
                    });

                    console.log('LAYER', lyr.source)
                    map.addLayer({
                        "id": lyr.name,
                        "type": "raster",
                        "source": lyr.source,
                        "layout": {
                            "visibility": "visible"
                        }
                    }, "aeroway-taxiway");
                })
                
            
            
            // .then(res => res.json())
                // .then(res => {
                //     console.log('res', res)
                //     config.timeSlices = res.seriesInfo;

                //     // Put together the layer data, then add them to the map
                //     //   buildLayers();
                //     //   addLayers();

                //     const layer = this.weatherLayers[0]
                //     const timeSlice = config.timeSlices[layer].series[0].ts;
                //     config.layers[layer] = {
                //         name: layer,
                //         source: layer + "Source",
                //         url: config.baseUrl + layer + "?ts=" + timeSlice + "&xyz={x}:{y}:{z}&apiKey=" + "3f8ed76d96d94f1f8ed76d96d98f1fc0"
                //     };

                //     const lyr = config.layers[layer];
                //     console.log("LAYER", lyr)
                //     map.addSource(lyr.source, {
                //         type: "raster",
                //         tiles: [lyr.url],
                //         tileSize: 256
                //     });
                //     map.addLayer({
                //         "id": lyr.name,
                //         "type": "raster",
                //         "source": lyr.source,
                //         "layout": {
                //             "visibility": "visible"
                //         }
                //     }, "aeroway-taxiway");


                // });
        }

        removeLayer() {
            const map = this.parent.getMap();
            map.removeLayer('raster');
            map.removeLayer('radar')
            this.source.removeFromMap(map, 'raster');
            this.source.removeFromMap(map, 'radarSource')
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

