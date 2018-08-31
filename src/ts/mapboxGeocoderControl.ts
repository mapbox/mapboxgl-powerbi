module powerbi.extensibility.visual {
    declare var MapboxGeocoder: any

    export class MapboxGeocoderControl implements mapboxgl.IControl {
        private geocoder: any
        private eventHandlers: { [eventName: string]: Function }
        private pin: mapboxgl.Marker

        constructor(accessToken: string) {
            this.geocoder = new MapboxGeocoder({
                accessToken: accessToken,
                zoom: 10,
                trackProximity: true
            })

            this.pin = new mapboxgl.Marker()
        }

        public onAdd(map: mapboxgl.Map): HTMLElement {
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
            this.unsubscribe()
            this.removePin()
            this.geocoder.onRemove(map)
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

        private addPin(map: mapboxgl.Map, position: number[]) {
            this.pin.setLngLat(position).addTo(map)
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
