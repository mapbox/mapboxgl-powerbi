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

    export class MapboxMap implements IVisual {
        private map: mapboxgl.Map;
        private mapDiv: HTMLDivElement;
        private host: IVisualHost;
        private firstRun: boolean = true;
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
            this.mapDiv.style.position = "absolute";
            this.mapDiv.style.top = "0";
            this.mapDiv.style.bottom ="0";
            this.mapDiv.style.left ="0";
            this.mapDiv.style.width = "100%";
            this.mapDiv.style.overflow = 'visible';
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
        }

        @logExceptions()
        public update(options: VisualUpdateOptions) {
            let styleChanged = false;
            var _this = this
            //Only run this step if there are lat/long values to parse
            if (options.dataViews[0].metadata.columns.length < 2) { 
                this.firstRun = false;
                return 
            };
            const dataView: DataView = options.dataViews[0];
            this.mapboxData  = mapboxConverter.convert(dataView, this.host);
            this.settings = MapboxSettings.parse<MapboxSettings>(dataView);


            if (!this.settings.api.accessToken) {
                return;
            }
            mapboxgl.accessToken = this.settings.api.accessToken;


            const mapOptions = {
                container: this.mapDiv,
                center: [-74.50, 40],
                zoom: 0
            }

            //If the map container doesnt exist yet, create it
            if (this.map === undefined ) {
                this.map = new mapboxgl.Map(mapOptions);
                this.map.addControl(new mapboxgl.NavigationControl());
                this.map.on('style.load', runload);
                mapboxUtils.addPopup(this.map, this.popup);
                mapboxUtils.addClick(this.map);
            }
            const layerType = this.settings.api.layerType;

            const layer = mapboxUtils.decorateLayer({
                id: 'data',
                source: 'data',
                type: layerType
            }, dataView.table.columns, this.mapboxData.maxSize)
            if (this.dataLayer != layer ) {
                this.dataLayer = layer;
            }


            if (this.mapStyle != this.settings.api.style) {
                this.mapStyle = this.settings.api.style;
                styleChanged = true;
                this.map.setStyle(this.mapStyle);
            }


            function onUpdate() {
                if (_this.map.getSource('data')) {
                    let source : any = _this.map.getSource('data');
                    source.setData( turf.featureCollection(_this.mapboxData.features));
                    _this.map.removeLayer('data');
                    _this.map.addLayer(_this.dataLayer);
                }
                else {
                    _this.map.addSource('data', {
                        type: "geojson", 
                        data: turf.featureCollection(_this.mapboxData.features),
                        buffer: 10
                    });

                    mapboxUtils.addBuildings(_this.map);

                    _this.map.addLayer(_this.dataLayer, 'waterway-label');
            }
        }


        function runload() {
            onUpdate();

            let bounds : any = turf.bbox(turf.featureCollection(_this.mapboxData.features));
            bounds = bounds.map( bound => {
                if (bound < -90) {
                    return -90;
                }
                if (bound > 90) {
                    return 90;
                }
                return bound;
            });

            _this.map.easeTo( {
                duration: 500,
                pitch: 0,
                bearing: 0
            });
            _this.map.fitBounds(bounds, {
                padding: 25
            });
            _this.firstRun = false;
            return true;
        }

        // If running update for the first time, wait for the load event
        if (_this.firstRun) {
            _this.map.once('load', runload);
        }
        else {
            //If refreshing the map, update the map if it's already fully rendered
            if (_this.map.loaded && !styleChanged) {
                runload();
            }
            else {
                //If refreshing the map and existing data is still loading, update when finished loading
                //_this.map.on('sourcedata', runload);
            }  
        }
        
    }

        @logExceptions()
        public destroy(): void {
            this.map.remove();
        }
    }
}
