
module powerbi.extensibility.visual.PBI_CV_EB3A4088_75C5_4746_9D8B_255A7B7ECD6C  {

    export function logExceptions(): MethodDecorator {
        return function (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<Function>)
        : TypedPropertyDescriptor<Function> {
            
            return {
                value: function () {
                    try {
                        return descriptor.value.apply(this, arguments);
                    } catch (e) {
                        console.error(e);
                        throw e;
                    }
                }
            }
        }
    }
   
    export class MapboxMap implements IVisual {
        private dataView: DataView;
        private map;
        // ** REMOVE**  Dont hardcode token before publishing!
        private accessToken = mapboxgl.accessToken = 'pk.eyJ1IjoicnNiYXVtYW5uIiwiYSI6IjdiOWEzZGIyMGNkOGY3NWQ4ZTBhN2Y5ZGU2Mzg2NDY2In0.jycgv7qwF8MMIWt4cT0RaQ'

         /**
         * Creates instance of MapboxglMap. This method is only called once.
         *
         * @constructor
         * @param {VisualConstructorOptions} options - Contains references to the element that will
         *                                             contain the visual and a reference to the host
         *                                             which contains services.
         */
        constructor(options: VisualConstructorOptions) {

            // Create a child div to stick the mapboxgl map canvas in
            options.element.className += 'map';

            //Initialize the map
            this.map = new mapboxgl.Map({
                container: options.element,
                style: 'mapbox://styles/mapbox/dark-v9', //stylesheet location
                center: [-74.50, 40], // starting position
                zoom: 2 // starting zoom
            });
        }

        /*public static converter(dataView: DataView) {
            const {columns, rows} = dataView.table;
            const c10 = d3.scale.category10();

            const datas = rows.map(function (row, idx) {
                let data = row.reduce(function (d, v, i) {
                    const role = Object.keys(columns[i].roles)[0]
                    d[role] = v;
                    return d;
                }, {});
                
                data.color = c10(data.category);

                return data;
            });

            return datas;
        }*/

        /**
         * Updates the state of the visual. Every sequential databinding and resize will call update.
         *
         * @function
         * @param {VisualUpdateOptions} options - Contains references to the size of the container
         *                                        and the dataView which contains all the data
         *                                        the visual had queried.
         */
        @logExceptions()
        public update(options: VisualUpdateOptions) {
            console.log('Visual update', options);

            let testData = [    
                {
                    longitude: -122.43988037109374,
                    latitude: 37.77505678240509,
                    category: 'San Francisco'
                },
                {
                    longitude: -121.91253662109376,
                    latitude: 37.35050947036205,
                    category: 'San Jose'
                },
                {
                    longitude: -122.22564697265625,
                    latitude: 37.496652341233364,
                    category: 'Palo Alto'
                }
            ]

            this.map.addSource("test", {
                "type": "geojson",
                "data": testData
            });

            this.map.addLayer({
                id: "test",
                type: "circle",
                source: "test",
                paint: {
                    "circle-color": "red",
                    "circle-radius": 25
                }
            })
        }

        /**
         * Destroy runs when the visual is removed. Any cleanup that the visual needs to
         * do should be done here.
         *
         * @function
         */
        public destroy(): void {
            console.log("removing map with destroy")
            this.map.remove();
        }
    }
}