/// <reference path="_references.ts" />

module powerbi.extensibility.visual.test {

    import MapboxData = powerbi.extensibility.visual.test.MapboxData;
    import MapboxChartBuilder = powerbi.extensibility.visual.test.MapboxChartBuilder;

    describe("Mapbox visual", () => {

        // define global spec variables here
        let host: IVisualHost;
        let target: HTMLElement;
        let palette: IColorPalette;
        let selectionManager: ISelectionManager;
        let tooltipService: ITooltipService;
        let locale: MockILocale;
        let allowInteractions: MockIAllowInteractions;
        let visualBuilder: MapboxChartBuilder;
        let dataViewBuilder: MapboxData;
        let dataView: DataView;

        beforeEach(() => {

            // mock constructor input variables
            target = document.createElement("div");
            palette = new MockIColorPalette();
            selectionManager = new MockISelectionManager();
            tooltipService = new MockITooltipService();
            locale = new MockILocale({ "en": "en-US" });
            allowInteractions = new MockIAllowInteractions(true);
            host = new MockIVisualHost(palette, selectionManager, tooltipService, locale, allowInteractions);

            visualBuilder = new MapboxChartBuilder(1920, 1080);
            dataViewBuilder = new MapboxData();
            dataView = dataViewBuilder.getDataView();
        });

        describe("the constructor method", () => {

            it("must create a visual without errors", () => {

                // create the visual for testing
                const visual = new Visual({ element: target, host: host });

                // ensure it exists
                expect(visual).toBeDefined();

            });
        });

        describe("the mapbox canvas", () => {
            beforeEach(() => {
                if (!__karma__.config.accessToken.length) {
                    fail("MAPBOX_TOKEN environment variable is not set. Please see README.md")
                    return
                }
                dataView.metadata.objects = {
                    api: {
                        accessToken: __karma__.config.accessToken,
                        style: 'mapbox://styles/mapbox/light-v9?optimize=true',
                    },
                    circle: {
                        show: false,
                    },
                    choropleth: {
                        show: false,
                    },
                    cluster: {
                        show: false,
                    },
                    heatmap: {
                        show: false,
                    },
                }
            })

            it("should be able to display circle viz", (done) => {
                dataView.metadata.objects.circle.show = true;
                visualBuilder.updateRenderTimeout(dataView, () => {
                    let errorText = ""
                    if (visualBuilder.error.length > 0) {
                        errorText = visualBuilder.error[0].innerText;
                    }
                    expect(errorText).toBe("", "The error element should be empty");
                    expect(visualBuilder.map.length).toBe(1, "There should be a Mapbox canvas element on the page");
                    visualBuilder.viz.on('updated', () => {
                        done();
                    });
                });
            })

            it("should be able to display cluster viz", (done) => {
                dataView.metadata.objects.cluster.show = true;
                visualBuilder.updateRenderTimeout(dataView, () => {
                    let errorText = ""
                    if (visualBuilder.error.length > 0) {
                        errorText = visualBuilder.error[0].innerText;
                    }
                    expect(errorText).toBe("", "The error element should be empty");
                    expect(visualBuilder.map.length).toBe(1, "There should be a Mapbox canvas element on the page");
                    visualBuilder.viz.on('updated', () => {
                        done();
                    });
                });
            })

            it("should be able to display heatmap viz", (done) => {
                dataView.metadata.objects.heatmap.show = true;
                visualBuilder.updateRenderTimeout(dataView, () => {
                    let errorText = ""
                    if (visualBuilder.error.length > 0) {
                        errorText = visualBuilder.error[0].innerText;
                    }
                    expect(errorText).toBe("", "The error element should be empty");
                    expect(visualBuilder.map.length).toBe(1, "There should be a Mapbox canvas element on the page");
                    visualBuilder.viz.on('updated', () => {
                        done();
                    });
                });
            })

            it("should be able to display choropleth viz", (done) => {
                dataView.metadata.objects.choropleth.show = true;
                visualBuilder.updateRenderTimeout(dataView, () => {
                    let errorText = ""
                    if (visualBuilder.error.length > 0) {
                        errorText = visualBuilder.error[0].innerText;
                    }
                    expect(errorText).toBe("", "The error element should be empty");
                    expect(visualBuilder.map.length).toBe(1, "There should be a Mapbox canvas element on the page");
                    visualBuilder.viz.on('updated', () => {
                        done();
                    });
                });
            })
        })
    });
}
