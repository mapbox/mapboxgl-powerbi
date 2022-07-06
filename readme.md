<a href="https://www.mapbox.com">
  <img src="https://static-assets.mapbox.com/www/logos/mapbox-logo-black.png" width="150"/>
</a>

# Mapbox Visual for Microsoft Power BI
[![No Maintenance Intended](http://unmaintained.tech/badge.svg)](http://unmaintained.tech/)

:no_entry: **DEPRECATED**

This version of Mapbox Visual for Microsoft Power BI is no longer maintained. You can find the live and maintained version of the plugin at: https://github.com/starschema/mapboxgl-powerbi

---
Make sense of your big & dynamic location data with the Mapbox Visual for Power BI.  Quickly design high-performance map visuals using graduated circles, clusters, and interactive heatmaps.  Even customize your Mapbox visual with custom shapes, imagery, and design using [Mapbox Studio](www.mapbox.com/studio).  Check out the [Mapbox Gallery](https://www.mapbox.com/gallery/) to get a sense of what's possible with Studio.

Drop in the Mapbox Visual to your Power BI dashboard from the [Microsoft Office Store](https://appsource.microsoft.com/en-us/product/power-bi-visuals/WA104381472?tab=Overview).
![](https://dl.dropbox.com/s/kymonz28oanehje/PowerBI-2.gif)

### Examples

* [Example Dashboard - NYC Cycling Incidents](https://www.mapbox.com/bites/00369)
* [Example Dashboard - 2017 USGS Earthquakes](https://app.powerbi.com/view?r=eyJrIjoiNTlkMzA5N2MtNGU0ZS00MDY5LTg1NTktNTZkODkyMmJjOThmIiwidCI6IjYyOWE3MGIyLTMyYjktNDEyNi05NTFlLTE3NjA0Y2Y0NTZlYyIsImMiOjF9)
* [Example Dashboard - 2017 FCC Broadband Speeds in New Jersey](https://app.powerbi.com/view?r=eyJrIjoiMTk4ZDk3OWYtNzc2Ny00NDE0LWE2ZWYtZDk5NjAwZTA3YTljIiwidCI6IjYyOWE3MGIyLTMyYjktNDEyNi05NTFlLTE3NjA0Y2Y0NTZlYyIsImMiOjF9)
    
### Documentation

- Check out the official Mapbox Visual for Power BI docs at: 
    * [Getting Started](https://www.mapbox.com/help/power-bi/)
    * [Creating a Choropleth](https://www.mapbox.com/help/power-bi-choropleth-map/)
- Check out 3rd party documentation below:
    * Sam Gehret's [July 2017 Mapbox Visual for Power BI webinar](https://www.youtube.com/watch?v=XtMqnls8dpE)
    * Devin Knight's [Pragmatic Works March 2018 Mapbox Visual for Power BI video tutorial](https://www.youtube.com/watch?v=qDCOo3bm01o)
    * David Eldersveld's[ BlueGranite `Exploring Maps in Power BI` webinar, March 2018](https://www.blue-granite.com/maps-in-power-bi-mar-2018?utm_campaign=Q1%202018%20Webinars&utm_content=68211202&utm_medium=referral&utm_source=dataveld)

### FAQ

#### Supported Power BI Environments and Tools
The Mapbox Visual for Power BI supports:

| Mapbox Visual  Version | PBI Report Server | PBI Mobile (iOS/Android) | PBI Embedded | PBI Publish to Web | PBI Desktop | Chrome | Firefox | Safari | Edge | IE11 |
|------------------------|-------------------|-------------------|--------------|--------------------|-------------|--------|---------|--------|------|------|
| v 1.2.4                | Yes             | Yes  | Yes          | Yes                | Yes         | Yes    | Yes     | Yes    | Yes  | No  |


#### Firewall rules - Domain names and ports to use with Power BI in a secure environment

The Mapbox Visual by default operates using API resources hosted on `api.mapbox.com` securely requested using HTTPS and your Mapbox access token.  If you need all requests to be made inside of your corporate or air-gapped network, you can host [Mapbox Atlas](https://www.mapbox.com/atlas/) on your own server and run the Mapbox Visual for Power BI completely on-premise.

**No data** in the Power BI data model is ever sent to Mapbox APIs.  Only the requested reference resources including map style sheets, vector tiles, icons, and fonts are retrieved from Mapbox APIs.

| Domain          | Port | Resource                        |
|--------------------|------|-----------------------------|
| api.mapbox.com     | 443  | icons, map styles, fonts |
| *.tiles.mapbox.com | 443  | vector tiles                |

#### How many data points does the Mapbox Visual support?

Mapbox supports up to the maximum allowed by Power BI, 30,000 rows, for all visualization types including Choropleth (fill), cluster, heatmap, and circle.  If your data is >30k rows, the Mapbox Visual will sample your data down to 30k rows and visualize the resultant sample.  If you need to visualize more than 30k rows for your use case, reach out to our sales team to connect you with a Mapbox Partner to setup a custom solution for your use case.


### Roadmap
- Current roadmap is managed by @samgehret.
- Check out the [project board](https://github.com/mapbox/mapboxgl-powerbi/projects) on this github for an up to date roadmap.
- v1.2 just released to the marketplace.  It will be follwed by v1.3 later in Q3 2018.
- To request feature enhancements or to report bugs, please log an [issue](https://github.com/mapbox/mapboxgl-powerbi/issues).
- Our release timeline will be discretionary based on new feature availability, but most likely every 2-3 months.

### Beta Version
- We will keep an up to date beta version in this section.
- [v1.3 beta](https://github.com/mapbox/mapboxgl-powerbi/blob/v1.3_beta/dist/mapboxGLMap.pbiviz) is the lastest beta.

### Developing and Contributing.
- This is an open source repo and we welcome contributions from the public.
- Please see [contributing.md](CONTRIBUTING.md) for more information.

### Adding MapboxGL Viz to a Power BI Dashboard

On Power BI Online or Desktop, click `add visual from marketplace` and search `Mapbox`.  Check out the visual on the Microsoft Office Store at https://appsource.microsoft.com/en-us/product/power-bi-visuals/WA104381472?tab=Overview.

![](https://dl.dropbox.com/s/m0rgaypm9d7o0ee/mapbox_marketplace_visual.png)

## What is Mapbox?

Mapbox is the location data platform for mobile and web applications. We provide [building blocks](https://www.mapbox.com/products/) to add location features like maps, search, and navigation into any experience you create. Use our simple and powerful APIs & SDKs and our open source libraries for interactivity and control.

Not a Mapbox user yet? [Sign up for an account here](https://www.mapbox.com/signup/). Once you’re signed in, all you need to start building with Power BI is a Mapbox access token. 


## Screenshots and GIFs

![](https://cl.ly/1J2d1x1q3R3F/download/Image%202018-07-21%20at%201.00.25%20PM.png)

![](https://dl.dropbox.com/s/9rzj04v1u1f2lp4/lasso_select.gif)

![](https://dl.dropbox.com/s/xc4nl5au5gxv8tr/powerbi_drill_choropleth_wildfire.gif)
