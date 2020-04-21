/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import "core-js/stable";
import "./../style/visual.less";
import powerbiVisualsApi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbiVisualsApi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbiVisualsApi.extensibility.visual.IVisual;
import IVisualHost = powerbiVisualsApi.extensibility.visual.IVisualHost;
import EnumerateVisualObjectInstancesOptions = powerbiVisualsApi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbiVisualsApi.VisualObjectInstance;
import DataView = powerbiVisualsApi.DataView;
import VisualObjectInstanceEnumerationObject = powerbiVisualsApi.VisualObjectInstanceEnumerationObject;

import { featureCollection } from "@turf/helpers"
import bbox from "@turf/bbox"
import bboxPolygon from "@turf/bbox-polygon"

import { Filter } from "./filter"
import { Palette } from "./palette"
import { RoleMap } from './roleMap'
import { DrawControl } from "./drawControl"
import { LegendControl } from "./legendControl"
import { AutoZoomControl } from "./autoZoomControl"
import { MapboxGeocoderControl } from "./mapboxGeocoderControl"

import * as mapboxgl from "mapbox-gl"
import { MapboxSettings } from "./settings";
import { zoomToData  } from "./mapboxUtils";
import { ITooltipServiceWrapper, createTooltipServiceWrapper, TooltipEventArgs } from "./tooltipServiceWrapper"
import { mapboxConverter } from "./mapboxConverter";
import { Templates } from "./templates";

import { Layer } from "./layers/layer"
import { Circle } from "./layers/circle"
import { Cluster } from "./layers/cluster"
import { Heatmap } from "./layers/heatmap"
import { Raster } from "./layers/raster"
import { Choropleth } from "./layers/choropleth"

export class MapboxMap implements IVisual {
    private target: HTMLElement;
    private settings: MapboxSettings;
    private mapDiv: HTMLElement;
    private errorDiv: HTMLElement;
    private mapStyle: string = "";
    private map: any;
    private geocoder: MapboxGeocoderControl;
    private autoZoomControl: AutoZoomControl;
    private navigationControl: mapboxgl.NavigationControl;
    private controlsPopulated: boolean;
    private roleMap: any;
    private previousZoom: number;
    private updatedHandler: Function = () => { }
    private layers: Layer[] = [];
    private legend: LegendControl;
    private filter: Filter;
    private palette: Palette;
    private host: IVisualHost;
    private drawControl: DrawControl;
    private tooltipServiceWrapper: ITooltipServiceWrapper;

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
        this.previousZoom = 0;
        if (document) {
            this.mapDiv = document.createElement('div');
            this.mapDiv.className = 'map';
            this.target.appendChild(this.mapDiv);

            this.errorDiv = document.createElement('div');
            this.errorDiv.className = 'error';
            this.target.appendChild(this.errorDiv);
        }
        this.host = options.host;
        this.filter = new Filter(this, options.host)
        this.palette = new Palette(this, options.host)
        this.controlsPopulated = false;
        this.navigationControl = new mapboxgl.NavigationControl();
        this.autoZoomControl = new AutoZoomControl(this.host);
        this.drawControl = new DrawControl(this.filter)
        this.tooltipServiceWrapper = createTooltipServiceWrapper(options.host.tooltipService, options.element);
    }

    onUpdate(map, settings, updatedHandler: Function) {
        try {
            this.layers.map(layer => {
                layer.applySettings(settings, this.roleMap);
            });

            this.updateLegend(settings)

            if (settings.api.autozoom) {
                const bounds = this.layers.map(layer => {
                    return layer.getBounds(settings);
                }).reduce((acc, bounds) => {
                    if (!bounds) {
                        return acc;
                    }
                    if (!acc) {
                        return bounds
                    }
                    const combined = featureCollection([
                        //bboxPolygon(acc), // TODO
                        //bboxPolygon(bounds)
                    ]);
                    return bbox(combined)
                });
                zoomToData(map, bounds);
            }
        }
        catch (error) {
            console.error("OnUpdate failed:", error)
        }
        finally {
            updatedHandler();
        }
    }

    public on(event: string, fn: Function) {
        switch (event) {
            case 'updated': {
                this.updatedHandler = fn;
            }
        }
    }


    private addMap() {
        if (this.map) {
            return
        }

        const center: [number, number] = [this.settings.api.startLong, this.settings.api.startLat];
        const mapOptions = {
            container: this.mapDiv,
            zoom: this.settings.api.zoom,
            center: center,
            transformRequest: (url, resourceType) => {
                if (url.slice(0, 25) == 'https://api.mapbox.com/v4' ||
                    url.slice(0, 26) == 'https://a.tiles.mapbox.com' ||
                    url.slice(0, 26) == 'https://b.tiles.mapbox.com' ||
                    url.slice(0, 26) == 'https://c.tiles.mapbox.com' ||
                    url.slice(0, 26) == 'https://d.tiles.mapbox.com') {
                    // Add PowerBI Plugin identifier for Mapbox API traffic
                    return {
                        url: [url.slice(0, url.indexOf("?") + 1), "pluginName=PowerBI&", url.slice(url.indexOf("?") + 1)].join('')
                    }
                }
                else {
                    // Do not transform URL for non Mapbox GET requests
                    return { url: url }
                }
            }
        }

        // If the map container doesn't exist yet, create it
        this.map = new mapboxgl.Map(mapOptions);

        this.layers = [];
        this.layers.push(new Raster(this));
        this.layers.push(new Heatmap(this));
        this.layers.push(new Cluster(this, () => {
            return this.roleMap.cluster()
        }))
        this.layers.push(new Choropleth(this, this.filter, this.palette));
        this.layers.push(new Circle(this, this.filter, this.palette));

        // @ts-ignore
        mapboxgl.config.API_URL = this.settings.api.apiUrl;


        this.filter.manageHandlers();
        this.drawControl.manageHandlers(this);

        this.map.on('zoom', () => {
            const newZoom = Math.floor(this.map.getZoom())
            if (this.previousZoom != newZoom) {
                this.previousZoom = newZoom;
                this.layers.map(layer => {
                    if (layer.handleZoom(this.settings)) {
                        layer.applySettings(this.settings, this.roleMap);
                    }
                });
                this.updateLegend(this.settings);
            }
        });
    }

    private removeMap() {
        if (this.map) {
            this.map.remove();
            this.map = null;
            this.mapStyle = "";
            this.layers = []
        }
    }

    private validateOptions(options: VisualUpdateOptions) {

        // Hide div and remove any child elements
        this.errorDiv.setAttribute("style", "display: none;");
        while (this.errorDiv.hasChildNodes()) { 
            this.errorDiv.removeChild(this.errorDiv.firstChild) 
        }

        // Check for Access Token
        if (!this.settings.api.accessToken) {
            this.errorDiv.innerHTML = Templates.MissingToken;
            return false;
        }

        // Check for Location properties
        const roles: any = options.dataViews[0].metadata.columns.map(column => {
            if (column.roles) {
                return Object.keys(column.roles);
            } else {
                return null;
            }
        }).reduce((acc, curr) => {
            if (curr) {
                curr.map(role => {
                    acc[role] = true;
                });
            }
            return acc;
        }, {});

        if ((this.settings.circle.show || this.settings.cluster.show || this.settings.heatmap.show) && (!(roles.latitude && roles.longitude))) {
            this.errorDiv.innerHTML = Templates.MissingGeo;
            return false;
        }
        else if (this.settings.choropleth.show && ((!roles.location || !roles.color))) {
            this.errorDiv.innerHTML = Templates.MissingLocationOrColor;
            return false;
        }
        else if (this.settings.choropleth.show && (
            !this.settings.choropleth.vectorTileUrl1 ||
            !this.settings.choropleth.sourceLayer1 ||
            !this.settings.choropleth.vectorProperty1)
        ) {
            this.errorDiv.innerHTML = Templates.MissingChoroplethSettings;
            return false;
        }
        else if (this.settings.cluster.show && !roles.cluster) {
            this.errorDiv.innerHTML = Templates.MissingCluster;
            return false;
        }

        return true;
    }

    public updateLayers(dataView: DataView) {
        const features = mapboxConverter.convert(dataView);

        this.palette.update(dataView, features);

        let datasources = {}
        this.layers.map(layer => {
            const source = layer.getSource(this.settings);
            if (source) {
                datasources[source.ID] = source;
            }
        })

        for (let id in datasources) {
            let datasource = datasources[id];
            datasource.update(this.map, features, this.roleMap, this.settings);
        };

        this.layers.map(layer => {
            this.tooltipServiceWrapper.addTooltip(
                this.map,
                layer,
                () => this.roleMap.tooltips(),
                (tooltipEvent: TooltipEventArgs<number>) => {
                    return layer.handleTooltip(tooltipEvent, this.roleMap, this.settings);
                }
            );
        });

        this.onUpdate(this.map, this.settings, this.updatedHandler);
    }

    public update(options: VisualUpdateOptions) {
        this.settings = MapboxMap.parseSettings(options && options.dataViews && options.dataViews[0]);

        const dataView: DataView = options.dataViews[0];

        if (!dataView) {
            console.error('No dataView received from powerBI api')
            return
        }

        if (!this.validateOptions(options)) {
            this.errorDiv.style.display = 'block';
            this.removeMap();
            return false;
        }

        if (dataView.categorical) {
            this.filter.setCategories(dataView.categorical.categories);
        }

        this.roleMap = new RoleMap(dataView.metadata);

        //this.updateCurrentLevel(this.settings.choropleth, options); // TODO


        if (!this.map) {
            this.addMap();
        }

        // Show/hide Mapbox control elements based on the Mapbox Controls toggle button
        this.manageControlElements();

        this.updateGeocoder();

        // Apply auto-zoom pin state from settings, if they differ (note that one is referring to pin state,
        // the other is referring to 'enabled' state, this is why we have the equality check and the negation)
        if (this.autoZoomControl.isPinned() == this.settings.api.autozoom) {
            this.autoZoomControl.setPin(!this.settings.api.autozoom);
        }

        if (mapboxgl.accessToken != this.settings.api.accessToken) {
            // @ts-ignore
            mapboxgl.accessToken = this.settings.api.accessToken;
        }


        let style = this.settings.api.style == 'custom' ? this.settings.api.styleUrl : this.settings.api.style;
        if (this.mapStyle == '' || this.mapStyle != style) {

            // This should run only once but it runs with different dataView
            // param every time so we need to set a different event handler on every
            // style change and deregister it when it ran.
            const delayedUpdate = (e) => {
                this.updateLayers(dataView);
                this.map.off('style.load', delayedUpdate);
            }
            this.map.on('style.load', delayedUpdate);
            if (this.mapStyle != style) {
                this.mapStyle = style;
                this.map.setStyle(this.mapStyle);
            }
        } else {
            this.updateLayers(dataView)
            return;
        }
    }

    private updateGeocoder() {
        if (this.settings.geocoder.show && !this.geocoder) {
            this.geocoder = new MapboxGeocoderControl(this.settings);
            this.map.addControl(this.geocoder);
        }
        else if (!this.settings.geocoder.show && this.geocoder) {
            this.map.removeControl(this.geocoder)
            this.geocoder = null
        }

        if (this.geocoder) {
            this.geocoder.update(this.map, this.settings)
        }
    }


    private updateLegend(settings: MapboxSettings) {
        if (this.legend) {
            this.legend.removeLegends()
        }

        if (!this.roleMap)
        {
            if (this.legend) {
                this.map.removeControl(this.legend)
                this.legend = null
            }

            return
        }

        // If no legend is added to legendControl remove
        // legendControl at the end of the update
        let removeLegend = true;
        this.layers.forEach(layer => {
            if (!layer.showLegend(settings, this.roleMap)) {
                return
            }

            if (!this.legend) {
                this.legend = new LegendControl()
                this.map.addControl(this.legend)
            }
            layer.addLegend(this.legend, this.roleMap, settings);

            // Legend is added to legendControl
            removeLegend = false
        });

        if (removeLegend && this.legend) {
            this.map.removeControl(this.legend)
            this.legend = null
        }
    }

    public getSettings() {
        return this.settings
    }

    public getRoleMap() {
        return this.roleMap;
    }

    public getMap() {
        return this.map;
    }

    public getExistingLayers(): Layer[] {
        return this.layers.filter(layer => layer.layerExists())
    }


    private static parseSettings(dataView: DataView): MapboxSettings {
        return <MapboxSettings>MapboxSettings.parse(dataView);
    }

    private manageControlElements() {
        if (this.settings.api.mapboxControls) {
            if (!this.controlsPopulated) {
                this.map.addControl(this.navigationControl);
                this.map.addControl(this.drawControl);
                this.map.addControl(this.autoZoomControl);
                this.controlsPopulated = true;
            }
        } else {
            if (this.controlsPopulated) {
                this.map.removeControl(this.navigationControl);
                this.map.removeControl(this.drawControl);
                this.map.removeControl(this.autoZoomControl);
                this.controlsPopulated = false;
            }
        }
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return MapboxSettings.enumerateObjectInstances(this.settings || MapboxSettings.getDefault(), options);
    }
}
