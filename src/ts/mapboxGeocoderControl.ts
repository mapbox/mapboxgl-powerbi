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


        constructor(settings: MapboxSettings) {
            this.accessToken = settings.api.accessToken
            this.zoom = settings.geocoder.zoom
            this.dropPin = settings.geocoder.dropPin
            this.enableIsochrone = settings.geocoder.isochrone
            this.isochroneProfile = settings.geocoder.isochroneProfile
            this.pin = new mapboxgl.Marker()
        }

        public update(map: mapboxgl.Map, settings: MapboxSettings) {

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

            if (!settings.geocoder.isochrone) {
                this.removeIsoChrone(map)
            }
            else {
                this.addIsochrone(map)
            }


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

            if (this.enableIsochrone && this.position) {
                this.removeIsoChrone(map)
                console.log(this.isochroneProfile)
                axios.get("https://api.mapbox.com/isochrone/v1/mapbox/" + this.isochroneProfile + "/" + this.position + "?contours_minutes=5,10,15,60&contours_colors=6706ce,04e813,4286f4&polygons=true&access_token=" + this.accessToken)
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
                    })
            }

        }

        private addPin(map: mapboxgl.Map, position: number[]) {
            this.position = position
            if (this.dropPin) {
                this.pin.setLngLat(position).addTo(map)
            }
            console.log("profile", this.isochroneProfile)
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
