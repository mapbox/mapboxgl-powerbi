module powerbi.extensibility.visual {
    "use strict";
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

    function onUpdate(map, mapboxData, dataLayer) {
        if (map.getSource('data')) {
            let source : any = map.getSource('data');
            source.setData( turf.featureCollection(mapboxData.features));
            map.removeLayer('data');
            map.addLayer(dataLayer);
        }
        else {
            map.addSource('data', {
                type: "geojson", 
                data: turf.featureCollection(mapboxData.features),
                buffer: 10
            });

            mapboxUtils.addBuildings(map);

            map.addLayer(dataLayer, 'waterway-label');
        }

        let bounds : any = turf.bbox(turf.featureCollection(mapboxData.features));
        bounds = bounds.map( bound => {
            if (bound < -90) {
                return -90;
            }
            if (bound > 90) {
                return 90;
            }
            return bound;
        });

        map.easeTo( {
            duration: 500,
            pitch: 0,
            bearing: 0
        });
        map.fitBounds(bounds, {
            padding: 25
        });
        return true;
    }


    export class MapboxMap implements IVisual {
        private map: mapboxgl.Map;
        private mapDiv: HTMLDivElement;
        private host: IVisualHost;
        private mapboxData: MapboxData;
        private settings: MapboxSettings;
        private dataLayer: mapboxgl.Layer;
        private popup: mapboxgl.Popup;
        private mapStyle: string = "";

         /**
         * This function returns the values to be displayed in the property pane for each object.
         * Usually it is a bind pass of what the property pane gave you, but sometimes you may want to do
         * validation and return other values/defaults
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            let instances: VisualObjectInstanceEnumeration = null;
            switch (options.objectName) {
                   default:
                        return MapboxSettings.enumerateObjectInstances(
                            this.settings || MapboxSettings.getDefault(),
                            options);
                }
        }

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            //Map initialization    
            this.mapDiv = document.createElement('div');
            this.mapDiv.className = 'map';
            options.element.appendChild(this.mapDiv);
            
            let mapLegend: HTMLElement;
            mapLegend = document.createElement('legend');
            mapLegend.className = 'legend';
            mapLegend.id = 'legend';
            this.mapDiv.appendChild(mapLegend);

            this.popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false
            });

            const mapOptions = {
                container: this.mapDiv,
                center: [-74.50, 40],
                zoom: 0
            }

            //If the map container doesnt exist yet, create it
            this.map = new mapboxgl.Map(mapOptions);
            this.map.addControl(new mapboxgl.NavigationControl());
            this.map.on('style.load', () => onUpdate(this.map, this.mapboxData, this.dataLayer));
            this.map.on('load', () => onUpdate(this.map, this.mapboxData, this.dataLayer));
            mapboxUtils.addPopup(this.map, this.popup);
            mapboxUtils.addClick(this.map);
        }

        @logExceptions()
        public update(options: VisualUpdateOptions) {
            const dataView: DataView = options.dataViews[0];
            this.settings = MapboxSettings.parse<MapboxSettings>(dataView);
            
            // Only run this step if there are lat/long values to parse
            // and accessToken is set in options
            if (options.dataViews[0].metadata.columns.length < 2 || !this.settings.api.accessToken) { 
                return 
            };

            this.mapboxData  = mapboxConverter.convert(dataView, this.host);

            if (mapboxgl.accessToken != this.settings.api.accessToken) {
                mapboxgl.accessToken = this.settings.api.accessToken;
            }

            const layer = mapboxUtils.decorateLayer({
                id: 'data',
                source: 'data',
                type: this.settings.api.layerType,
            }, dataView.table.columns, this.mapboxData.maxSize)

            if (this.dataLayer != layer ) {
                this.dataLayer = layer;
            }

            let styleChanged = false;
            if (this.mapStyle != this.settings.api.style) {
                this.mapStyle = this.settings.api.style;
                styleChanged = true;
                this.map.setStyle(this.mapStyle);
            }

            // If the map is loaded and style has not changed in this update
            // then we should update right now.
            if (this.map.loaded && !styleChanged) {
                onUpdate(this.map, this.mapboxData, this.dataLayer);
            }
        }

        @logExceptions()
        public destroy(): void {
            this.map.remove();
            this.map = null;
        }
    }
}
