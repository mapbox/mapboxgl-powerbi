# Mapbox GL Extension for PowerBI

## Developing

- `npm install -g powerbi-visuals-tools`
- Follow Steps on https://github.com/Microsoft/PowerBI-visuals/blob/master/tools/CertificateSetup.md to setup your PowerBI live visual
- `npm install`
- Log into your PowerBI web UI and enable dev tools https://github.com/Microsoft/PowerBI-visuals/blob/master/tools/DebugVisualSetup.md
- `pbiviz start`
- Add a custom visual using the PowerBI custom viz options, using a latitude and longitude variable.

![](https://cl.ly/2Q0n0w0z2O3A/download/Image%202017-08-21%20at%209.58.29%20AM.png)


### Issues

1. **Nested Window object** - see https://github.com/ryanbaumann/mapboxgl-powerBI/blob/master/src/js/mapboxglAdaptor.js
2. **30,000 Row limit** - see https://github.com/ryanbaumann/mapboxgl-powerBI/blob/master/capabilities.json#L31


