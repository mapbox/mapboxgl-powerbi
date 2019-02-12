module powerbi.extensibility.visual {
    export interface TooltipEventArgs<TData> {
        data: TData;
        coordinates: number[];
        isTouchEvent: boolean;
    }

    export interface ITooltipServiceWrapper {
        addTooltip<T>(
            map,
            layer,
            tooltips,
            getTooltipInfoDelegate: (args: TooltipEventArgs<T>) => VisualTooltipDataItem[],
            reloadTooltipDataOnMouseMove?: boolean): void;
        hide(immediately?: boolean): void;
    }

    const DefaultHandleTouchDelay = 1000;

    export function createTooltipServiceWrapper(tooltipService: ITooltipService, rootElement: HTMLElement, handleTouchDelay: number = DefaultHandleTouchDelay): ITooltipServiceWrapper {
        return new TooltipServiceWrapper(tooltipService, rootElement, handleTouchDelay);
    }

    class TooltipServiceWrapper implements ITooltipServiceWrapper {
        private handleTouchTimeoutId: number;
        private visualHostTooltipService: ITooltipService;
        private rootElement: HTMLElement;
        private handleTouchDelay: number;

        // Store the registered showTooltip and hideTooltip handler functions, so that
        // we can unregister them successfully
        private mapShowTooltip: any;
        private mapHideTooltip: any;

        constructor(tooltipService: ITooltipService, rootElement: HTMLElement, handleTouchDelay: number) {
            this.visualHostTooltipService = tooltipService;
            this.handleTouchDelay = handleTouchDelay;
            this.rootElement = rootElement;
            this.mapShowTooltip = {}
            this.mapHideTooltip = {}
        }

        public addTooltip<T>(
            map,
            layer: Layer,
            getTooltips: () => any,
            getTooltipInfoDelegate: (args: TooltipEventArgs<T>) => VisualTooltipDataItem[],
            reloadTooltipDataOnMouseMove?: boolean): void {

                if (!map || !this.visualHostTooltipService.enabled()) {
                    return;
                }

                let rootNode = this.rootElement;

                // Multiple following assignments are because browsers only
                // pick up assigments if they understand the assigned value
                // and ignore all other case.
                rootNode.style.cursor = '-webkit-grab';
                rootNode.style.cursor = 'grab';

                layer.getLayerIDs().map( layerId => {
                    if (!this.mapHideTooltip[layerId]) {
                        this.mapHideTooltip[layerId] = (e) => {
                            this.hide()
                        };
                    }

                    if (!this.mapShowTooltip[layerId]) {
                        this.mapShowTooltip[layerId] = mapboxUtils.debounce((e) => {
                            rootNode.style.cursor = 'pointer';
                            let tooltipEventArgs = this.makeTooltipEventArgs<T>(e, getTooltips);
                            if (!tooltipEventArgs)
                                return;

                            let tooltipInfo: VisualTooltipDataItem[];
                            if (reloadTooltipDataOnMouseMove || true) {
                                tooltipInfo = getTooltipInfoDelegate(tooltipEventArgs);
                                if (!tooltipInfo || tooltipInfo.length < 1) {
                                    return;
                                }
                            }
                            this.visualHostTooltipService.show({
                                coordinates: tooltipEventArgs.coordinates,
                                isTouchEvent: false,
                                dataItems: tooltipInfo,
                                identities: [],
                            });
                        }, 6, true)
                    }

                    map.off('mouseleave', layerId, this.mapHideTooltip[layerId]);
                    map.off('mousemove', layerId, this.mapShowTooltip[layerId]);

                    if (layer.hasTooltip(getTooltips())) {
                        map.on('mouseleave', layerId, this.mapHideTooltip[layerId]);
                        map.on('mousemove', layerId, this.mapShowTooltip[layerId]);
                    }
                    else {
                        this.mapShowTooltip[layerId] = null
                        this.mapHideTooltip[layerId] = null
                    }
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

        public hide(immediately = false): void {
            const rootNode = this.rootElement;

            rootNode.style.cursor = '-webkit-grab';
            rootNode.style.cursor = 'grab';
            this.visualHostTooltipService.hide({
                isTouchEvent: false,
                immediately
            });
        }

        private makeTooltipEventArgs<T>(e: any, getTooltips: () => any): TooltipEventArgs<T> {

            let tooltipEventArgs : TooltipEventArgs<T> = null;
            try {
                if (e.features && e.features.length > 0) {
                    tooltipEventArgs = {
                        // Take only the first three element until we figure out how
                        // to add pager to powerbi native tooltips
                        data: e.features.slice(0, 3).map(feature => {
                            return Object.keys(feature.properties).map(prop => {
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
