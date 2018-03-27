module powerbi.extensibility.visual {

    export interface TooltipEventArgs<TData> {
        data: TData;
        coordinates: number[];
        isTouchEvent: boolean;
    }

    export interface ITooltipServiceWrapper {
        addTooltip<T>(
            map,
            layerId,
            getTooltipInfoDelegate: (args: TooltipEventArgs<T>) => VisualTooltipDataItem[],
            reloadTooltipDataOnMouseMove?: boolean): void;
        hide(): void;
    }

    const DefaultHandleTouchDelay = 1000;

    export function createTooltipServiceWrapper(tooltipService: ITooltipService, rootElement: Element, handleTouchDelay: number = DefaultHandleTouchDelay): ITooltipServiceWrapper {
        return new TooltipServiceWrapper(tooltipService, rootElement, handleTouchDelay);
    }
    
    class TooltipServiceWrapper implements ITooltipServiceWrapper {
        private handleTouchTimeoutId: number;
        private visualHostTooltipService: ITooltipService;
        private rootElement: Element;
        private handleTouchDelay: number;
        
        constructor(tooltipService: ITooltipService, rootElement: Element, handleTouchDelay: number) {
            this.visualHostTooltipService = tooltipService;
            this.handleTouchDelay = handleTouchDelay;
            this.rootElement = rootElement;
        }
        
        public addTooltip<T>(
            map,
            layerId,
            getTooltipInfoDelegate: (args: TooltipEventArgs<T>) => VisualTooltipDataItem[],
            reloadTooltipDataOnMouseMove?: boolean): void {
            
            if (!map || !this.visualHostTooltipService.enabled()) {
                return;
            }
            
            let rootNode = this.rootElement;

            const hideTooltip = (e) => {
                this.visualHostTooltipService.hide({
                    isTouchEvent: false,
                    immediately: false,
                });
            }

            map.on('mouseleave', layerId, hideTooltip);
            map.on('touchend', layerId, hideTooltip);

            console.log("Adding mousemove event handler");
            map.on('mousemove', layerId, (e) => {

                let tooltipEventArgs = this.makeTooltipEventArgs<T>(e);
                if (!tooltipEventArgs)
                    return;
                
                let tooltipInfo: VisualTooltipDataItem[];
                if (reloadTooltipDataOnMouseMove || true) {
                    tooltipInfo = getTooltipInfoDelegate(tooltipEventArgs);
                    if (tooltipInfo == null)
                        return;
                }
                
                this.visualHostTooltipService.show({
                    coordinates: tooltipEventArgs.coordinates,
                    isTouchEvent: false,
                    dataItems: tooltipInfo,
                    identities: [],
                });
            });
        }

        private getDisplayNameMap(metadata) {
            let ret = {}
            metadata.columns.map(column => {
                Object.keys(column.roles).map(role => {
                    ret[role] = column.displayName
                });
            });
            return ret;
        }
        


        public hide(): void {
            this.visualHostTooltipService.hide({ immediately: true, isTouchEvent: false });
        }

        private makeTooltipEventArgs<T>(e: any): TooltipEventArgs<T> {

            let tooltipEventArgs : TooltipEventArgs<T> = null;
            try {
                if (e.features && e.features.length > 0) {

                    tooltipEventArgs = {
                        data: e.features.map( feature => {
                            return Object.keys(feature.properties).map( prop => {
                                return {
                                    key: prop,
                                    value: feature.properties[prop]
                                }
                            });
                        }),
                        coordinates: [e.point.x, e.point.y],
                        isTouchEvent: false
                    };

                }
            } finally {
                return tooltipEventArgs;
            }
        }
    }
}
