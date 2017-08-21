# Mapbox GL Extension for PowerBI

Current version of the extension is in `mapboxgl` module folder.

## Developing

- `cd mapboxgl`
- `npm install -g powerbi-visuals-tools`
- Follow Steps on https://github.com/Microsoft/PowerBI-visuals/blob/master/tools/CertificateSetup.md to setup your PowerBI live visual
- `npm install`
- Log into your PowerBI web UI and enable dev tools https://github.com/Microsoft/PowerBI-visuals/blob/master/tools/DebugVisualSetup.md
- Replace all mentions of `window.getDevicePixelRation` with the value `1` in `node_modules/mapboxgl/dist/mapbox-gl.min.js`.
- 
- `pbiviz start`

### Reference

Here is a working Leaflet extension for PowerBI
https://github.com/woodbuffalo/powerbi-leaflet

