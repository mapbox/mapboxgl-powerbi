module powerbi.extensibility.visual {
    declare var MapboxGeocoder: any
    declare var axios: any

    export class MapboxGeocoderControl implements mapboxgl.IControl {
        private geocoder: any
        private eventHandlers: { [eventName: string]: Function }
        private pin: mapboxgl.Marker
        private dropPin: boolean
        private accessToken: string
        private zoom: number
        private isochrone: any
        private enableIsochrone: boolean
        private isochroneProfile: string
        private position: any
        private five: boolean
        private ten: boolean
        private thirty: boolean
        private sixty: boolean
        private contourMinutes: string
        private contourColors: string
        private fiveColor: string
        private tenColor: string
        private thirtyColor: string
        private sixtyColor: string
        private map: any


        constructor(settings: MapboxSettings) {
            this.accessToken = settings.api.accessToken
            this.zoom = settings.geocoder.zoom
            this.dropPin = settings.geocoder.dropPin
            this.enableIsochrone = settings.geocoder.isochrone
            this.isochroneProfile = settings.geocoder.isochroneProfile
            this.pin = new mapboxgl.Marker()
            this.five = settings.geocoder.five
            this.ten = settings.geocoder.ten
            this.thirty = settings.geocoder.thirty
            this.sixty = settings.geocoder.sixty
            this.fiveColor = settings.geocoder.fiveColor
            this.tenColor = settings.geocoder.tenColor.substr(1)
            this.thirtyColor = settings.geocoder.thirtyColor.substr(1)
            this.sixtyColor = settings.geocoder.sixtyColor.substr(1)
            this.contourMinutes = ''
            this.contourColors = ''
        }

        public update(map: mapboxgl.Map, settings: MapboxSettings) {

            this.map = map
            if (!settings.geocoder.dropPin) {
                this.removePin()
            }



            const reinitNeeded = false
                || this.accessToken != settings.api.accessToken
                || this.zoom != settings.geocoder.zoom

            this.accessToken = settings.api.accessToken
            this.zoom = settings.geocoder.zoom
            this.dropPin = settings.geocoder.dropPin
            this.enableIsochrone = settings.geocoder.isochrone
            this.isochroneProfile = settings.geocoder.isochroneProfile
            this.five = settings.geocoder.five
            this.ten = settings.geocoder.ten
            this.thirty = settings.geocoder.thirty
            this.sixty = settings.geocoder.sixty
            this.fiveColor = settings.geocoder.fiveColor.substr(1)
            this.tenColor = settings.geocoder.tenColor.substr(1)
            this.thirtyColor = settings.geocoder.thirtyColor.substr(1)
            this.sixtyColor = settings.geocoder.sixtyColor.substr(1)
            // this.contourMinutes = ''
            // this.contourColors = ''

            this.addIsochrone(this.map)


            if (reinitNeeded && this.geocoder) {
                map.removeControl(this)
                map.addControl(this)
            }

        }

        public onAdd(map: mapboxgl.Map): HTMLElement {
            this.geocoder = new MapboxGeocoder({
                accessToken: this.accessToken,
                zoom: this.zoom,
                trackProximity: false // BUG in mapbox-gl-geocoder
            })

            this.quirkPosition(map)
            if (map.loaded()) {
                this.subscribe(map)
            }
            else {
                const self = this
                map.on('load', function () {
                    map.off('load', this) // `this` is the function not the control
                    self.subscribe(map)
                })
            }


            return this.geocoder.onAdd(map)
        }

        public onRemove(map: mapboxgl.Map) {
            if (this.geocoder) {
                this.unsubscribe()
                this.removePin()
                this.geocoder.onRemove(map)
                this.geocoder = null
            }
        }

        public getDefaultPosition(): string {
            return "top-center"
        }

        private subscribe(map: mapboxgl.Map) {
            if (this.eventHandlers) {
                console.warn('MapboxGeocoderControl: forced unsubscribe before resubscribe')
                this.unsubscribe()
            }

            this.eventHandlers = {
                // Listen for the `result` event from the MapboxGeocoder that is triggered when a user
                // makes a selection and add a symbol that matches the result.
                result: (ev) => {
                    this.addPin(map, ev.result.center)
                },
                clear: () => {
                    this.removePin()
                    this.removeIsoChrone(map)
                },
            }

            Object.keys(this.eventHandlers).forEach(eventName => {
                if (this.eventHandlers[eventName]) {
                    this.geocoder.on(eventName, this.eventHandlers[eventName])
                }
            })
        }

        private unsubscribe() {
            if (!this.eventHandlers) {
                return
            }

            Object.keys(this.eventHandlers).forEach(eventName => {
                if (this.eventHandlers[eventName]) {
                    this.geocoder.off(eventName, this.eventHandlers[eventName])
                    this.eventHandlers[eventName] = null
                }
            })

            this.eventHandlers = null
        }

        private removePin() {
            this.pin.remove()
        }

        private removeIsoChrone(map: mapboxgl.Map) {
            if (map.getLayer('isochrone')) {
                map.removeLayer('isochrone')
            }
            if (map.getSource('isochrone-source')) {
                map.removeSource('isochrone-source')
            }

        }

        private addIsochrone(map: mapboxgl.Map) {



            this.contourMinutes = ''
            this.contourColors = ''
            if (this.enableIsochrone && this.position) {
                this.removeIsoChrone(map)
                if (this.five) {
                    this.contourMinutes = this.contourMinutes + "5"
                    this.contourColors = this.contourColors + this.fiveColor
                }
                if (this.ten) {
                    if (this.contourColors === '') {
                        this.contourMinutes = this.contourMinutes + "10"
                        // this.tenColor = this.tenColor.substr(1)
                        this.contourColors = this.contourColors + this.tenColor
                    }
                    else {
                        this.contourMinutes = this.contourMinutes + ",10"
                        // this.tenColor = this.tenColor.substr(1)
                        this.contourColors = this.contourColors + "," + this.tenColor
                    }


                }
                if (this.thirty) {
                    if (this.contourColors === '') {
                        this.contourMinutes = this.contourMinutes + "30"
                        // this.thirtyColor = this.thirtyColor.substr(1)
                        this.contourColors = this.contourColors + this.thirtyColor
                    }
                    else {
                        this.contourMinutes = this.contourMinutes + ",30"
                        // this.thirtyColor = this.thirtyColor.substr(1)
                        this.contourColors = this.contourColors + "," + this.thirtyColor
                    }

                }
                if (this.sixty) {
                    if (this.contourColors === '') {
                        this.contourMinutes = this.contourMinutes + "60"
                        // this.sixtyColor = this.sixtyColor.substr(1)
                        this.contourColors = this.contourColors + this.sixtyColor
                    }
                    else {
                        this.contourMinutes = this.contourMinutes + ",60"
                        // this.sixtyColor = this.sixtyColor.substr(1)
                        this.contourColors = this.contourColors + "," + this.sixtyColor
                    }

                }

                if (this.contourColors && this.contourMinutes) {
                    axios.get("https://api.mapbox.com/isochrone/v1/mapbox/" + this.isochroneProfile + "/" + this.position + "?contours_minutes=" + this.contourMinutes + "&contours_colors=" + this.contourColors + "&polygons=true&access_token=" + this.accessToken)
                        .then(response => {
                            this.isochrone = response.data
                            map.addSource('isochrone-source', {
                                type: 'geojson',
                                data: this.isochrone
                            });

                            map.addLayer({
                                'id': 'isochrone',
                                'type': 'line',
                                'source': 'isochrone-source',
                                'layout': {},
                                'paint': {
                                    'line-color': ['get', 'color'],
                                    'line-width': 5
                                }
                            })
                            // map.addLayer({
                            //     'id': 'isochrone-symbol',
                            //     'type': 'symbol',
                            //     'source': 'isochrone-source',
                            //     'layout': {
                            //         'text-field':'TEST',
                            //         'symbol-placement': 'line',
                            //         'text-allow-overlap': false,
                            //         'text-padding': 1,
                            //         'text-max-angle': 90,
                            //         'text-size': 40,
                            //         'text-letter-spacing': 0.1,
                            //         'symbol-avoid-edges': true
                            //     },
                            //     'paint': {
                            //         'text-halo-color': 'rgba(0, 0, 0, 0)',
                            //         'text-color': ['get', 'color'],
                            //         'text-halo-width': 12,
                            //         'text-translate': [0,-40]
                            //     }
                            // })

                        })
                }
            }


        }

        private addPin(map: mapboxgl.Map, position: number[]) {
            this.position = position
            if (this.dropPin) {
                this.pin.setLngLat(position).addTo(map)
            }
            if (this.enableIsochrone) {

                this.addIsochrone(map)

            }

        }

        // This a workaround for the mapboxgl.Map to support the top-center position string
        private quirkPosition(map: any) {
            const positionName = this.getDefaultPosition()

            if (Object.keys(map._controlPositions).indexOf(positionName) > -1) {
                return
            }

            const controlContainer = map._controlContainer
            const tagName = "div"
            const className = "mapboxgl-ctrl-" + positionName

            const el = document.createElement(tagName)
            el.className = className
            controlContainer.appendChild(el)
            map._controlPositions[positionName] = el
        }
    }
}
