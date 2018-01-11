# Mapbox GL Extension for PowerBI

Make sense of your location big, dynamic location data with Mapbox.  Create interactive Graduated Circle, Cluster, and Heatmaps at 60FPS for your PowerBI reports and dashboards.  Easily handle large datasets up to the PowerBI maximum of 30,000 points.

[Example Dashboard](https://app.powerbi.com/view?r=eyJrIjoiMThkYTY1MmItYzMwOC00NjUyLWJhOGMtODZiZWRkNzcxMzY2IiwidCI6IjYyOWE3MGIyLTMyYjktNDEyNi05NTFlLTE3NjA0Y2Y0NTZlYyIsImMiOjF9)

![](https://dl.dropbox.com/s/gtsfojr60a3pbep/powerbi-readme-170901.gif)

## Status

In active development!  

- Only point geometry sources are currently supported
- Only a dark map style is currently supported
- Only one color ramp is currently supported

### Adding MapboxGL Viz to a PowerBI Report

On PowerBI Online, add the `dist/mapboxGLMap.pbiviz` file in this repository as a custom visual in your report.

![](https://cl.ly/3303070u081q/download/Image%202017-09-01%20at%203.47.52%20PM.png)


## Developing

- `npm install -g powerbi-visuals-tools`
- Follow Steps on https://github.com/Microsoft/PowerBI-visuals/blob/master/tools/CertificateSetup.md to setup your PowerBI live visual
- `npm install`
- Log into your PowerBI web UI and enable dev tools https://github.com/Microsoft/PowerBI-visuals/blob/master/tools/DebugVisualSetup.md
- `npm start`
- Add a custom visual using the PowerBI custom viz options, using a latitude and longitude variable.

### Building

`npm run package`
    
### Updating Mapbox GL JS to latest version

Due to an open PowerBI [issue](https://github.com/Microsoft/PowerBI-visuals/issues/165) mapbox-gl.js needs to be copied from under `node_modules` to `src/modules` and patched. During the patch all `window.devicePixelRatio` needs to be replaced to `window.window.devicePixelRatio`.  This custom-altered version of the Mapbox GL js library is packaged with this repository and will need to be manually checked and validated for new mapboxgl JS version upgrades.
