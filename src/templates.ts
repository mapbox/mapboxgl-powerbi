export const Templates = {

    MissingToken: `

        <h4>Start building with Mapbox in 3 steps:

            <a class="mapboxLink" href="https://mapbox.com/account/access-tokens">Click here to get a free Mapbox access token</a>

        </h4>

        <ol>

            <li style="font-size: 18px;"> 1. Copy your Mapbox access token from the link above.</li>

            <img style="padding-bottom: 20px;" src="https://github.com/starschema/mapboxgl-powerbi/blob/master/assets/copy_mapbox_access_token.png?raw=true"></img><br>

            <li style="font-size: 18px;"> 2. Paste your Mapbox access token into the PowerBI Viz format pannel.</li>

            <img style="padding-bottom: 20px;" src="https://github.com/starschema/mapboxgl-powerbi/blob/master/assets/add-access-token.png?raw=true"></img><br>

            <li style="font-size: 18px;"> 3. Add latitude and longitude OR location & color fields to your viz.</li><br>

            <img style="padding-bottom: 20px;" src="https://github.com/starschema/mapboxgl-powerbi/blob/master/assets/add-long-lat.png?raw=true"></img><br>

            <li style="font-size: 18px;"> Select a map style, then design heatmaps, circles, and cluster visualizations in the format pannel.</li><br>

            <img style="padding-bottom: 20px;" src="https://github.com/starschema/mapboxgl-powerbi/blob/master/assets/start-visualizing.png?raw=true"></img><br>

        </ol>

    `,

    MissingGeo:`

        <h4>

        Begin by adding latitude and longitude attributes to your viz for Circle Layers. Use Location and Color for Choropleth layers. Circle Layer is enabled by default. Change this from the Format panel.

        </h4>

        <img style="padding-bottom: 20px;" src="https://github.com/starschema/mapboxgl-powerbi/blob/master/assets/add-long-lat.png?raw=true"></img><br>

    `,

    MissingLocationOrColor: `

        <h4>

        Add only Location & Color fields to use a choropleth layer. Choropleth layers do not support using multiple layers in the same map - only a choropleth layer is allowed. Location attribute must match US State, Global Country, or US Postal Code. The default setting is US States and can be changed in the "Data Level" property within Choropleth settings. For other polygons, use a custom tileset.

        </h4>

    `,

    MissingChoroplethSettings: `

        <h4>

            Set Vector Tile Url, Source Layer Name and Vector Property properties in the Choropleth section of the settings.

        </h4>

    `,

    MissingCluster: `

        <h4>

            Add a cluster field to use a cluster layer.

        </h4>

       <img style="padding-bottom: 20px;" src="https://github.com/starschema/mapboxgl-powerbi/blob/master/assets/add-cluster.png?raw=true"></img><br>

    `,

    noGlSupport: `<h4>It looks like this machine doesn't support Web GL. The Mapbox visual requires access to a GPU to run Web GL. This is most often caused by running Power BI Desktop from a Virtual Machine. Please try from a physical machine instead. </h4>`,

    invalidStyleUrl: `

        <h4>

            Your Custom Style URL is invalid.

            <a href="https://docs.mapbox.com/help/glossary/style-url/">Mapbox docs style URL</a>

        </h4>

    `

}